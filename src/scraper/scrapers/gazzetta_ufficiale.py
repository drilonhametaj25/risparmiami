"""Gazzetta Ufficiale RSS scraper for Italian fiscal legislation.

Monitors the RSS feed of the Italian Gazzetta Ufficiale (Official Gazette)
for fiscally relevant acts.  Filters items by fiscal keywords, optionally
follows detail links to extract full text, and produces structured rule
dicts via direct text parsing (no external AI API).

RSS feed: https://www.gazzettaufficiale.it/rss/SG  (Serie Generale)

Schedule: bisettimanale (lunedi e giovedi ore 4)
Categories: detrazioni, bonus-inps, incentivi
"""
import sys
import os
import json
import re
import time
import logging
from datetime import datetime
from email.utils import parsedate_to_datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from bs4 import BeautifulSoup

from base import BaseScraper
from config import SOURCES
from extractors.rule_extractor import save_rules_json
from extractors.diff_checker import DiffChecker

logger = logging.getLogger(__name__)

USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "gazzetta_ufficiale")

RSS_FEED_URL = "https://www.gazzettaufficiale.it/rss/SG"

# Maximum number of retries for HTTP calls
MAX_RETRIES = 3
RETRY_DELAY = 3  # seconds

# Rate-limiting delay between detail-page requests (seconds)
DETAIL_REQUEST_DELAY = 2

# Fiscal keywords used to filter RSS items (matched case-insensitively)
FISCAL_KEYWORDS = [
    "detrazione", "bonus", "agevolazione", "esenzione", "imposta",
    "aliquota", "credito d'imposta", "credito di imposta", "deduzione",
    "irpef", "ires", "tribut", "reddito", "fiscale", "finanziaria",
    "bilancio", "contribut", "previdenz", "pension",
]

# Pre-compiled pattern for fiscal keyword matching
# (uses word boundaries for short keywords to avoid false positives like "cooperativa" matching "iva")
_FISCAL_PATTERN = re.compile(
    "|".join(re.escape(kw) for kw in FISCAL_KEYWORDS),
    re.IGNORECASE,
)

# Regex pattern for extracting euro amounts (e.g. "1.500,00 euro", "200 euro")
_EURO_PATTERN = re.compile(r"(\d[\d.]*(?:[.,]\d+)?)\s*euro", re.IGNORECASE)

# Category-determination keyword groups
_DETRAZIONI_KEYWORDS = re.compile(
    r"detrazione|deduzione|irpef|ires", re.IGNORECASE,
)
_BONUS_KEYWORDS = re.compile(
    r"bonus|inps|previdenz|pension", re.IGNORECASE,
)
_INCENTIVI_KEYWORDS = re.compile(
    r"agevolazione|incentiv|contribut", re.IGNORECASE,
)

# Target-determination keyword groups
_TARGET_PERSONA_KEYWORDS = re.compile(
    r"persona|cittadin|contribuent|lavorat", re.IGNORECASE,
)
_TARGET_AZIENDA_KEYWORDS = re.compile(
    r"impresa|aziend|societ[aà]", re.IGNORECASE,
)

# Selectors for extracting full text from detail pages, in priority order
_DETAIL_SELECTORS = [
    "#corpo_documento",
    ".documento",
    "#dettaglioAtto",
    ".testo-atto",
    "article",
    "main",
]


class GazzettaUfficialeScraper(BaseScraper):
    """Scraper for the Italian Gazzetta Ufficiale RSS feed."""

    name = "gazzetta_ufficiale"
    source_url = SOURCES.get("gazzetta_ufficiale", "https://www.gazzettaufficiale.it")

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/xml, text/xml, */*;q=0.5",
            "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
        })
        self._diff_checker = DiffChecker()
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ------------------------------------------------------------------
    # fetch
    # ------------------------------------------------------------------
    def fetch(self) -> dict:
        """Fetch and filter fiscally relevant items from the GU RSS feed.

        Returns:
            Dict with 'articles' key containing a list of article dicts,
            each with 'title', 'link', 'description', 'content', 'pubDate',
            and 'text' keys.
        """
        rss_text = self._fetch_rss_feed()
        if not rss_text:
            logger.error("Impossibile scaricare il feed RSS della Gazzetta Ufficiale")
            return {"articles": []}

        items = self._parse_rss_items(rss_text)
        logger.info(f"RSS feed: {len(items)} elementi totali trovati")

        # Filter by fiscal keywords
        fiscal_items = self._filter_fiscal_items(items)
        logger.info(
            f"Dopo filtro keywords fiscali: {len(fiscal_items)} elementi rilevanti "
            f"su {len(items)} totali"
        )

        # Attempt to enrich each item with full text from its detail page
        for item in fiscal_items:
            link = item.get("link", "")
            if link:
                try:
                    time.sleep(DETAIL_REQUEST_DELAY)
                    full_text = self._fetch_detail_page(link)
                    if full_text and len(full_text) > len(item.get("text", "")):
                        item["text"] = full_text
                except Exception as exc:
                    logger.debug(f"Errore nel download della pagina {link}: {exc}")

        # Deduplicate by link
        seen_links: set[str] = set()
        unique_articles: list[dict] = []
        for item in fiscal_items:
            link = item.get("link", "")
            key = link if link else item.get("title", "")
            if key and key not in seen_links:
                seen_links.add(key)
                unique_articles.append(item)

        # Save raw data
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"gazzetta_ufficiale_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(unique_articles, f, ensure_ascii=False, indent=2)
        logger.info(f"Salvati {len(unique_articles)} articoli in {raw_path}")

        return {"articles": unique_articles}

    # ------------------------------------------------------------------
    # _fetch_rss_feed
    # ------------------------------------------------------------------
    def _fetch_rss_feed(self) -> str | None:
        """Download the RSS feed with retry logic.

        Returns the raw XML text, or None on failure.
        """
        for attempt in range(MAX_RETRIES):
            try:
                resp = self.session.get(RSS_FEED_URL, timeout=30)
                resp.raise_for_status()
                return resp.text
            except requests.exceptions.RequestException as exc:
                logger.warning(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} di download RSS fallito: {exc}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
        return None

    # ------------------------------------------------------------------
    # _parse_rss_items
    # ------------------------------------------------------------------
    def _parse_rss_items(self, rss_text: str) -> list[dict]:
        """Parse RSS XML and return a list of item dicts.

        Tries the 'xml' parser first (requires lxml); falls back to
        'html.parser' if lxml is unavailable.
        """
        soup = self._make_soup(rss_text)
        items: list[dict] = []

        for item_el in soup.find_all("item"):
            title = self._tag_text(item_el, "title")
            link = self._tag_text(item_el, "link")
            description = self._tag_text(item_el, "description")
            pub_date_raw = self._tag_text(item_el, "pubDate") or self._tag_text(item_el, "pubdate")

            # content:encoded -- BeautifulSoup normalises the colon-prefixed
            # tag name depending on the parser used.
            content = (
                self._tag_text(item_el, "content:encoded")
                or self._tag_text(item_el, "content")
                or self._tag_text(item_el, "encoded")
                or ""
            )

            pub_date = self._parse_pub_date(pub_date_raw)

            # Build the best available text representation.
            # Strip HTML from content:encoded if present.
            content_plain = self._strip_html(content) if content else ""
            text = content_plain or description or title or ""

            items.append({
                "title": title,
                "link": link,
                "description": description,
                "content": content,
                "pubDate": pub_date,
                "text": text,
            })

        return items

    # ------------------------------------------------------------------
    # _filter_fiscal_items
    # ------------------------------------------------------------------
    @staticmethod
    def _filter_fiscal_items(items: list[dict]) -> list[dict]:
        """Keep only items whose title OR description contains a fiscal keyword."""
        fiscal: list[dict] = []
        for item in items:
            searchable = f"{item.get('title', '')} {item.get('description', '')}"
            if _FISCAL_PATTERN.search(searchable):
                item["_matched_keywords"] = _FISCAL_PATTERN.findall(searchable)
                fiscal.append(item)
        return fiscal

    # ------------------------------------------------------------------
    # _fetch_detail_page
    # ------------------------------------------------------------------
    def _fetch_detail_page(self, url: str) -> str | None:
        """Follow a link and try to extract the full act text.

        Tries several CSS selectors; returns plain text or None.
        """
        for attempt in range(MAX_RETRIES):
            try:
                resp = self.session.get(url, timeout=30)
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")

                # Try selectors in order of specificity
                for selector in _DETAIL_SELECTORS:
                    element = soup.select_one(selector)
                    if element:
                        text = element.get_text(separator="\n", strip=True)
                        if text and len(text) > 100:
                            return text

                # Fallback: strip chrome and grab body content
                for tag in soup.select("nav, footer, header, script, style, aside"):
                    tag.decompose()
                body = soup.body
                if body:
                    text = body.get_text(separator="\n", strip=True)
                    if text and len(text) > 100:
                        return text[:20000]

                return None

            except requests.exceptions.RequestException as exc:
                logger.debug(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} per {url} fallito: {exc}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))

        return None

    # ------------------------------------------------------------------
    # extract
    # ------------------------------------------------------------------
    def extract(self, raw_data: dict) -> list[dict]:
        """Build structured rule dicts from fetched GU articles.

        Uses direct text parsing -- no external AI API calls.

        Args:
            raw_data: Dict with 'articles' key from fetch().

        Returns:
            Deduplicated list of rule dicts in standard format.
        """
        articles = raw_data.get("articles", [])
        if not articles:
            logger.warning("Nessun articolo da analizzare dalla Gazzetta Ufficiale")
            return []

        all_rules: list[dict] = []

        for article in articles:
            title = article.get("title", "").strip()
            description = article.get("description", "").strip()
            text = article.get("text", "").strip()

            if not title:
                continue

            slug = self._slugify(title)
            category = self._determine_category(text or description or title)
            target = self._determine_target(text or description or title)
            max_amount = self._extract_max_amount(text or description)

            short_description = description if description else text[:500]
            full_description = text[:3000] if text else description[:3000]

            rule = {
                "slug": slug,
                "name": title[:200],
                "shortDescription": short_description[:500],
                "fullDescription": full_description[:3000],
                "category": category,
                "target": target,
                "certaintyLevel": "certo",
                "sourceName": "Gazzetta Ufficiale",
                "maxAmount": max_amount,
                "howToClaim": "",
                "requiredDocs": [],
                "tags": ["legislazione", "gazzetta-ufficiale"],
                "requirements": [],
            }

            all_rules.append(rule)
            logger.info(f"Estratta regola '{slug}' da '{title[:60]}...'")

        # Deduplicate by slug
        seen_slugs: set[str] = set()
        unique_rules: list[dict] = []
        for rule in all_rules:
            slug = rule.get("slug", "")
            if slug and slug not in seen_slugs:
                seen_slugs.add(slug)
                unique_rules.append(rule)

        # Persist extracted rules
        extracted_dir = os.path.join(
            os.path.dirname(__file__), "..", "outputs", "extracted",
        )
        save_rules_json(
            unique_rules,
            os.path.join(
                extracted_dir,
                f"gazzetta_ufficiale_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole estratte dalla Gazzetta Ufficiale: {len(unique_rules)}")
        return unique_rules

    # ------------------------------------------------------------------
    # diff
    # ------------------------------------------------------------------
    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries.

        Uses DiffChecker with sourceName = 'Gazzetta Ufficiale'.
        """
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated

    # ------------------------------------------------------------------
    # Helper: _slugify
    # ------------------------------------------------------------------
    @staticmethod
    def _slugify(text: str) -> str:
        """Generate a URL-friendly slug from text.

        Lowercases, replaces non-alphanumeric chars with hyphens,
        prefixes with 'gu-', and truncates to 80 characters.
        """
        slug = text.lower().strip()
        # Replace spaces and underscores with hyphens
        slug = re.sub(r"[\s_]+", "-", slug)
        # Remove everything that is not alphanumeric or hyphen
        slug = re.sub(r"[^a-z0-9-]", "", slug)
        # Collapse consecutive hyphens
        slug = re.sub(r"-{2,}", "-", slug)
        # Strip leading/trailing hyphens
        slug = slug.strip("-")
        # Prefix and truncate
        slug = f"gu-{slug}"
        return slug[:80]

    # ------------------------------------------------------------------
    # Helper: _determine_category
    # ------------------------------------------------------------------
    @staticmethod
    def _determine_category(text: str) -> str:
        """Determine the rule category from matched keywords.

        Priority order:
        1. 'detrazioni' if detrazione/deduzione/irpef/ires found
        2. 'bonus-inps' if bonus/inps/previdenz/pension found
        3. 'incentivi' if agevolazione/incentiv/contribut found
        4. default: 'detrazioni'
        """
        if _DETRAZIONI_KEYWORDS.search(text):
            return "detrazioni"
        if _BONUS_KEYWORDS.search(text):
            return "bonus-inps"
        if _INCENTIVI_KEYWORDS.search(text):
            return "incentivi"
        return "detrazioni"

    # ------------------------------------------------------------------
    # Helper: _determine_target
    # ------------------------------------------------------------------
    @staticmethod
    def _determine_target(text: str) -> str:
        """Determine whether the rule targets 'persona' or 'azienda'.

        Returns 'persona' if person-related keywords are found,
        'azienda' if business-related keywords are found,
        'persona' as default.
        """
        has_persona = bool(_TARGET_PERSONA_KEYWORDS.search(text))
        has_azienda = bool(_TARGET_AZIENDA_KEYWORDS.search(text))

        if has_azienda and not has_persona:
            return "azienda"
        # Default to 'persona' -- covers the case where both or neither match
        return "persona"

    # ------------------------------------------------------------------
    # Helper: _extract_max_amount
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_max_amount(text: str) -> float | None:
        """Extract the largest plausible euro amount from text.

        Searches for patterns like '1000 euro', '1.500,00 euro', etc.
        Returns the largest value in [100, 500_000] range, or None.
        """
        matches = _EURO_PATTERN.findall(text)
        if not matches:
            return None

        amounts: list[float] = []
        for raw in matches:
            # Normalise Italian number formatting:
            #   dots are thousands separators, commas are decimal separators
            cleaned = raw.replace(".", "").replace(",", ".")
            try:
                value = float(cleaned)
                if 100 <= value <= 500_000:
                    amounts.append(value)
            except ValueError:
                continue

        return max(amounts) if amounts else None

    # ------------------------------------------------------------------
    # Helper: _parse_pub_date
    # ------------------------------------------------------------------
    @staticmethod
    def _parse_pub_date(raw: str | None) -> str:
        """Parse an RSS pubDate into ISO-8601 format.

        Tries email.utils.parsedate_to_datetime first (handles RFC 2822),
        then falls back to common strptime patterns, and finally returns
        the current datetime if nothing works.
        """
        if not raw:
            return datetime.now().isoformat()

        raw = raw.strip()

        # Strategy 1: RFC 2822 via email.utils
        try:
            dt = parsedate_to_datetime(raw)
            return dt.isoformat()
        except Exception:
            pass

        # Strategy 2: common date patterns
        for fmt in (
            "%a, %d %b %Y %H:%M:%S %z",
            "%a, %d %b %Y %H:%M:%S",
            "%d %b %Y %H:%M:%S %z",
            "%d %b %Y %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S",
            "%d/%m/%Y",
            "%Y-%m-%d",
        ):
            try:
                dt = datetime.strptime(raw, fmt)
                return dt.isoformat()
            except ValueError:
                continue

        logger.debug(f"Impossibile parsare la data: '{raw}'")
        return datetime.now().isoformat()

    # ------------------------------------------------------------------
    # Helper: _make_soup
    # ------------------------------------------------------------------
    @staticmethod
    def _make_soup(text: str) -> BeautifulSoup:
        """Create a BeautifulSoup instance, preferring the 'xml' parser.

        Falls back to 'html.parser' if lxml-xml is not available.
        """
        try:
            return BeautifulSoup(text, "xml")
        except Exception:
            logger.debug("Parser 'xml' non disponibile, fallback a 'html.parser'")
            return BeautifulSoup(text, "html.parser")

    # ------------------------------------------------------------------
    # Helper: _tag_text
    # ------------------------------------------------------------------
    @staticmethod
    def _tag_text(parent, tag_name: str) -> str:
        """Extract the text content of the first child tag with the given name.

        Returns empty string if the tag is not found.
        """
        tag = parent.find(tag_name)
        if tag:
            return tag.get_text(strip=True)
        return ""

    # ------------------------------------------------------------------
    # Helper: _strip_html
    # ------------------------------------------------------------------
    @staticmethod
    def _strip_html(html: str) -> str:
        """Remove HTML tags from a string, returning plain text."""
        try:
            soup = BeautifulSoup(html, "html.parser")
            return soup.get_text(separator=" ", strip=True)
        except Exception:
            # Crude fallback: strip with regex
            return re.sub(r"<[^>]+>", " ", html).strip()
