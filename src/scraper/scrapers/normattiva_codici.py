"""Normattiva.it scraper for Italian legal codes (Codici).

Downloads the full text of fiscally-relevant Italian legal codes from
Normattiva and extracts individual articles that contain fiscal keywords.

Codes scraped:
  - TUIR (Testo Unico Imposte sui Redditi)
  - Codice del Processo Tributario
  - Codice degli Incentivi
  - Codice del Terzo Settore
  - Codice Civile (parti fiscali)

Each article is checked against a list of fiscal keywords; only articles
matching at least one keyword are kept.  No external AI API is used --
extraction is done entirely via regex and text parsing.

Schedule: semestrale (every 6 months)
Categories: detrazioni, incentivi, bonus-inps
"""
import sys
import os
import json
import re
import time
import logging
from datetime import datetime
from urllib.parse import urljoin

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from bs4 import BeautifulSoup

from base import BaseScraper
from config import SOURCES
from extractors.rule_extractor import save_rules_json
from extractors.diff_checker import DiffChecker

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__), "..", "outputs", "raw", "normattiva_codici",
)
NORMATTIVA_BASE = "https://www.normattiva.it"

# HTTP behaviour
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds, doubled on each retry (exponential backoff)
REQUEST_DELAY = 2  # seconds between consecutive requests

# Source name used in Rule.sourceName *and* passed to DiffChecker
SOURCE_NAME = "Normattiva - Codici"

# ---------------------------------------------------------------------------
# Codes to scrape
# ---------------------------------------------------------------------------

CODICI: dict[str, dict] = {
    "tuir": {
        "name": "TUIR - Testo Unico Imposte sui Redditi",
        "url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917",
    },
    "processo_tributario": {
        "name": "Codice del Processo Tributario",
        "url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1992-12-31;546",
    },
    "codice_incentivi": {
        "name": "Codice degli Incentivi",
        "url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2025-11-27;184",
    },
    "terzo_settore": {
        "name": "Codice del Terzo Settore",
        "url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2017-07-03;117",
    },
    "codice_civile": {
        "name": "Codice Civile (parti fiscali)",
        "url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262",
    },
}

# ---------------------------------------------------------------------------
# Fiscal keywords (case-insensitive matching)
# ---------------------------------------------------------------------------

FISCAL_KEYWORDS: list[str] = [
    "detrazione", "bonus", "agevolazione", "esenzione", "imposta",
    "aliquota", "credito d'imposta", "credito di imposta", "deduzione",
    "irpef", "ires", "iva", "tribut", "reddito", "fiscale",
]

# Pre-compiled pattern for fiscal keyword matching
_FISCAL_RE = re.compile(
    "|".join(re.escape(kw) for kw in FISCAL_KEYWORDS),
    re.IGNORECASE,
)

# Regex to split full-text into individual articles
# Matches "Art. 1", "Art. 123-bis", "Articolo 42" etc.
_ARTICLE_SPLIT_RE = re.compile(
    r"(?=(?:Art\.\s*\d+|Articolo\s*\d+))",
    re.IGNORECASE,
)

# Regex to extract article number from article header
_ARTICLE_NUM_RE = re.compile(
    r"(?:Art\.?|Articolo)\s*(\d+(?:\s*-?\s*(?:bis|ter|quater|quinquies|sexies|septies|octies|novies|decies))?)",
    re.IGNORECASE,
)

# Regex to extract euro amounts
_EURO_PATTERN = re.compile(
    r"(\d[\d.]*(?:[.,]\d+)?)\s*euro",
    re.IGNORECASE,
)

# Selectors for the article body on Normattiva detail pages
_BODY_SELECTORS = [".bodyTesto", "#testoAtto", ".art-body", "div.testo"]


# ===================================================================
# Scraper
# ===================================================================

class NormattivaCodiciScraper(BaseScraper):
    """Scraper for individual fiscal articles from Italian legal codes."""

    name = "normattiva_codici"
    source_url = SOURCES.get("normattiva", "https://www.normattiva.it")

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
        })
        self._diff_checker = DiffChecker()
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ------------------------------------------------------------------
    # HTTP helpers
    # ------------------------------------------------------------------

    def _get_with_retry(self, url: str) -> requests.Response | None:
        """GET *url* with up to MAX_RETRIES attempts and exponential backoff.

        Returns the Response on success, or None after all retries are
        exhausted.
        """
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = self.session.get(url, timeout=60)
                resp.raise_for_status()
                return resp
            except requests.exceptions.RequestException as exc:
                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                logger.warning(
                    "Tentativo %d/%d fallito per %s: %s  (retry in %ds)",
                    attempt, MAX_RETRIES, url, exc, delay,
                )
                if attempt < MAX_RETRIES:
                    time.sleep(delay)
        return None

    # ------------------------------------------------------------------
    # fetch
    # ------------------------------------------------------------------

    def fetch(self) -> dict:
        """Fetch fiscal articles from all configured legal codes.

        Returns
        -------
        dict
            ``{"codes": {code_key: [article_dict, ...], ...}}``
            Each *article_dict* has keys ``number``, ``text``, ``keywords``.
        """
        all_codes: dict[str, list[dict]] = {}

        for code_key, code_info in CODICI.items():
            code_name = code_info["name"]
            code_url = code_info["url"]
            logger.info("Scaricamento codice: %s (%s)", code_name, code_url)

            try:
                articles = self._fetch_code(code_key, code_url)
                all_codes[code_key] = articles
                logger.info(
                    "Codice '%s': %d articoli fiscali trovati",
                    code_key, len(articles),
                )
            except Exception:
                logger.exception("Errore nello scaricamento di '%s'", code_key)
                all_codes[code_key] = []

            # Rate-limit between codes
            time.sleep(REQUEST_DELAY)

        # Persist raw data for auditability
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"codici_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as fh:
            json.dump(all_codes, fh, ensure_ascii=False, indent=2)
        logger.info("Dati grezzi salvati in %s", raw_path)

        return {"codes": all_codes}

    # ------------------------------------------------------------------
    # _fetch_code
    # ------------------------------------------------------------------

    def _fetch_code(self, code_key: str, url: str) -> list[dict]:
        """Download a single code and return its fiscal articles.

        The method first tries to detect whether the landing page already
        contains the full text or whether it provides navigation links to
        individual articles.  It then delegates accordingly.
        """
        resp = self._get_with_retry(url)
        if resp is None:
            logger.error("Impossibile scaricare %s dopo %d tentativi", url, MAX_RETRIES)
            return []

        soup = BeautifulSoup(resp.text, "html.parser")

        # Save raw HTML for audit
        try:
            html_path = os.path.join(OUTPUT_DIR, f"{code_key}_index.html")
            with open(html_path, "w", encoding="utf-8") as fh:
                fh.write(resp.text)
        except Exception:
            logger.debug("Impossibile salvare HTML indice per %s", code_key)

        # Strategy 1: page has navigation links to individual articles
        article_links = self._find_article_links(soup)
        if article_links:
            logger.info(
                "Codice '%s': trovati %d link ad articoli, seguo i link",
                code_key, len(article_links),
            )
            return self._fetch_articles_by_links(code_key, article_links)

        # Strategy 2: full text is present on the page -- split it
        full_text = self._extract_body_text(soup)
        if full_text and len(full_text) > 500:
            logger.info(
                "Codice '%s': testo completo presente (%d caratteri), splitto in articoli",
                code_key, len(full_text),
            )
            return self._split_and_filter(full_text)

        logger.warning("Codice '%s': nessun testo o link trovati", code_key)
        return []

    # ------------------------------------------------------------------
    # Navigation link detection
    # ------------------------------------------------------------------

    def _find_article_links(self, soup: BeautifulSoup) -> list[str]:
        """Return a list of absolute URLs pointing to individual articles.

        Normattiva code pages sometimes provide a table-of-contents with
        links whose href contains ``/atto/caricaArticolo`` or a fragment
        like ``#art`` followed by a number.
        """
        links: list[str] = []
        seen: set[str] = set()

        for anchor in soup.find_all("a", href=True):
            href: str = anchor["href"]
            # Match article detail links
            if "/atto/caricaArticolo" in href or "/atto/vediArticolo" in href:
                abs_url = href if href.startswith("http") else urljoin(NORMATTIVA_BASE, href)
                if abs_url not in seen:
                    seen.add(abs_url)
                    links.append(abs_url)

        return links

    # ------------------------------------------------------------------
    # Fetch articles via individual links
    # ------------------------------------------------------------------

    def _fetch_articles_by_links(
        self, code_key: str, urls: list[str],
    ) -> list[dict]:
        """Fetch each article link and keep those with fiscal keywords."""
        fiscal_articles: list[dict] = []

        for url in urls:
            time.sleep(REQUEST_DELAY)
            resp = self._get_with_retry(url)
            if resp is None:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            text = self._extract_body_text(soup)
            if not text:
                continue

            # Extract the article number from the text header
            num_match = _ARTICLE_NUM_RE.search(text[:200])
            art_num = num_match.group(1).strip() if num_match else "0"

            matched_keywords = self._match_fiscal_keywords(text)
            if not matched_keywords:
                continue

            fiscal_articles.append({
                "number": art_num,
                "text": text,
                "keywords": matched_keywords,
            })
            logger.debug(
                "Art. %s di '%s' contiene keyword fiscali: %s",
                art_num, code_key, matched_keywords,
            )

        return fiscal_articles

    # ------------------------------------------------------------------
    # Split full text into articles and filter
    # ------------------------------------------------------------------

    def _split_and_filter(self, full_text: str) -> list[dict]:
        """Split a full-text code into articles, keep fiscal ones."""
        parts = _ARTICLE_SPLIT_RE.split(full_text)
        fiscal_articles: list[dict] = []

        for part in parts:
            part = part.strip()
            if not part:
                continue

            num_match = _ARTICLE_NUM_RE.search(part[:200])
            if not num_match:
                continue  # not an article header

            art_num = num_match.group(1).strip()
            matched_keywords = self._match_fiscal_keywords(part)
            if not matched_keywords:
                continue

            fiscal_articles.append({
                "number": art_num,
                "text": part,
                "keywords": matched_keywords,
            })

        return fiscal_articles

    # ------------------------------------------------------------------
    # HTML body extraction
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_body_text(soup: BeautifulSoup) -> str:
        """Extract the article body text from a Normattiva page.

        Tries several known CSS selectors in order of specificity.  Falls
        back to the ``<main>`` element (minus nav/footer/scripts).
        """
        for selector in _BODY_SELECTORS:
            el = soup.select_one(selector)
            if el:
                return el.get_text(separator="\n", strip=True)

        # Fallback: grab main content, strip noise
        for tag in soup.select("nav, footer, header, script, style"):
            tag.decompose()
        main = (
            soup.select_one("main")
            or soup.select_one('[role="main"]')
            or soup.body
        )
        if main:
            return main.get_text(separator="\n", strip=True)[:50_000]
        return ""

    # ------------------------------------------------------------------
    # Keyword matching
    # ------------------------------------------------------------------

    @staticmethod
    def _match_fiscal_keywords(text: str) -> list[str]:
        """Return a deduplicated list of fiscal keywords found in *text*."""
        found: list[str] = []
        seen: set[str] = set()
        text_lower = text.lower()
        for kw in FISCAL_KEYWORDS:
            if kw in text_lower and kw not in seen:
                seen.add(kw)
                found.append(kw)
        return found

    # ------------------------------------------------------------------
    # Euro amount extraction
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_max_amount(text: str) -> float | None:
        """Extract the largest euro amount from *text* within plausible range.

        Looks for patterns like ``1000 euro``, ``1.500,00 euro``, etc.
        Returns the largest value between 100 and 500 000, or ``None``.
        """
        matches = _EURO_PATTERN.findall(text)
        if not matches:
            return None

        amounts: list[float] = []
        for raw in matches:
            cleaned = raw.replace(".", "").replace(",", ".")
            try:
                value = float(cleaned)
                if 100 <= value <= 500_000:
                    amounts.append(value)
            except ValueError:
                continue

        return max(amounts) if amounts else None

    # ------------------------------------------------------------------
    # Target detection
    # ------------------------------------------------------------------

    @staticmethod
    def _detect_target(text: str) -> str:
        """Heuristic to decide whether an article targets persons or firms."""
        text_lower = text.lower()
        persona_kw = ("persona", "cittadin", "contribuent", "lavorat", "dipendent")
        azienda_kw = ("impresa", "aziend", "societ")

        is_persona = any(kw in text_lower for kw in persona_kw)
        is_azienda = any(kw in text_lower for kw in azienda_kw)

        if is_azienda and not is_persona:
            return "azienda"
        # Default to persona (individuals) when both or neither match
        return "persona"

    # ------------------------------------------------------------------
    # Category detection
    # ------------------------------------------------------------------

    @staticmethod
    def _detect_category(code_key: str, text: str) -> str:
        """Return the rule category based on the code and article text."""
        if code_key == "codice_incentivi":
            return "incentivi"

        text_lower = text.lower()
        if "inps" in text_lower or "previdenz" in text_lower:
            return "bonus-inps"

        return "detrazioni"

    # ------------------------------------------------------------------
    # Tag generation
    # ------------------------------------------------------------------

    @staticmethod
    def _build_tags(code_key: str, text: str) -> list[str]:
        """Build a list of tags for the rule."""
        tags = ["legislazione", f"codice-{code_key}"]
        text_lower = text.lower()

        if "irpef" in text_lower:
            tags.append("irpef")
        if "ires" in text_lower:
            tags.append("ires")
        if "iva" in text_lower:
            tags.append("iva")
        if "detrazione" in text_lower:
            tags.append("detrazione")
        if "deduzione" in text_lower:
            tags.append("deduzione")
        if "credito d'imposta" in text_lower or "credito di imposta" in text_lower:
            tags.append("credito-imposta")
        if "bonus" in text_lower:
            tags.append("bonus")

        return tags

    # ------------------------------------------------------------------
    # Slug generation
    # ------------------------------------------------------------------

    @staticmethod
    def _make_slug(code_key: str, article_number: str) -> str:
        """Build a deterministic slug for an article.

        Format: ``normattiva-{code_key}-art-{number}``
        Truncated to 80 characters.
        """
        # Normalise the article number: lowercase, strip whitespace, hyphens
        num = article_number.lower().strip().replace(" ", "")
        slug = f"normattiva-{code_key}-art-{num}"
        # Remove characters that are not alphanumeric or hyphen
        slug = re.sub(r"[^a-z0-9-]", "", slug)
        slug = re.sub(r"-{2,}", "-", slug).strip("-")
        return slug[:80]

    # ==================================================================
    # extract
    # ==================================================================

    def extract(self, raw_data: dict) -> list[dict]:
        """Transform raw fetched articles into structured rule dicts.

        Args:
            raw_data: Dict with ``codes`` key as returned by :meth:`fetch`.

        Returns:
            Deduplicated list of rule dicts.
        """
        codes: dict[str, list[dict]] = raw_data.get("codes", {})
        if not codes:
            logger.warning("Nessun codice da analizzare")
            return []

        all_rules: list[dict] = []

        for code_key, articles in codes.items():
            code_name = CODICI.get(code_key, {}).get("name", code_key)
            for article in articles:
                art_num = article.get("number", "0")
                text = article.get("text", "")

                if not text or len(text.strip()) < 50:
                    continue

                slug = self._make_slug(code_key, art_num)

                # Name: "Art. N - Code Name", truncated to 200 chars
                name = f"Art. {art_num} - {code_name}"[:200]

                short_desc = text[:500]
                full_desc = text[:3000]

                category = self._detect_category(code_key, text)
                target = self._detect_target(text)
                max_amount = self._extract_max_amount(text)
                tags = self._build_tags(code_key, text)

                rule: dict = {
                    "slug": slug,
                    "name": name,
                    "shortDescription": short_desc,
                    "fullDescription": full_desc,
                    "category": category,
                    "target": target,
                    "certaintyLevel": "certo",
                    "sourceName": SOURCE_NAME,
                    "maxAmount": max_amount,
                    "howToClaim": "",
                    "requiredDocs": [],
                    "tags": tags,
                    "requirements": [],
                }

                all_rules.append(rule)
                logger.info("Estratta regola '%s' da '%s'", slug, code_name)

        # Deduplicate by slug (keep first occurrence)
        seen_slugs: set[str] = set()
        unique_rules: list[dict] = []
        for rule in all_rules:
            if rule["slug"] not in seen_slugs:
                seen_slugs.add(rule["slug"])
                unique_rules.append(rule)

        # Persist extracted rules for auditability
        extracted_dir = os.path.join(
            os.path.dirname(__file__), "..", "outputs", "extracted",
        )
        save_rules_json(
            unique_rules,
            os.path.join(
                extracted_dir,
                f"normattiva_codici_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(
            "Totale regole estratte da codici Normattiva: %d", len(unique_rules),
        )
        return unique_rules

    # ==================================================================
    # diff
    # ==================================================================

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries.

        Uses :pyattr:`SOURCE_NAME` (``"Normattiva - Codici"``) as the
        source parameter so that DiffChecker queries only rules whose
        ``sourceName`` column equals that value.
        """
        result = self._diff_checker.check(rules, SOURCE_NAME)
        return result.new, result.updated
