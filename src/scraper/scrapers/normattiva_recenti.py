"""Normattiva recent legislation scraper.

Downloads recent legislation acts from Normattiva by year (2025, 2026) using the
elencoPerData endpoint and filters for fiscally relevant ones based on title keywords.

Parses article text directly into structured rule dicts -- no Claude API calls.

Schedule: weekly
Categories: detrazioni, bonus-inps, incentivi, isee
"""
import sys
import os
import json
import re
import time
import logging
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from bs4 import BeautifulSoup

from base import BaseScraper
from config import SOURCES
from extractors.rule_extractor import save_rules_json
from extractors.diff_checker import DiffChecker

logger = logging.getLogger(__name__)

USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "normattiva_recenti")

NORMATTIVA_BASE = "https://www.normattiva.it"
ELENCO_PER_DATA_URL = f"{NORMATTIVA_BASE}/ricerca/elencoPerData"

# Years to scrape
TARGET_YEARS = [2025, 2026]

# Maximum acts to fetch detail pages for, per year
MAX_ACTS_PER_YEAR = 50

# HTTP retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds
REQUEST_DELAY = 2  # seconds between requests (rate-limiting)

# Regex pattern for extracting euro amounts
_EURO_PATTERN = re.compile(r"(\d[\d.]*(?:[.,]\d+)?)\s*euro", re.IGNORECASE)

# Fiscal keywords to filter acts by title
FISCAL_KEYWORDS = [
    "detrazione", "bonus", "agevolazione", "esenzione", "imposta",
    "aliquota", "credito d'imposta", "credito di imposta", "deduzione",
    "irpef", "ires", "tribut", "reddito", "fiscale", "finanziaria",
    "bilancio", "contribut", "previdenz", "pension", "welfare",
    "isee", "inps",
]

# Category-determination keyword groups (checked in order; first match wins)
_CATEGORY_MAP = [
    ("detrazioni", ["detrazione", "deduzione", "irpef", "ires"]),
    ("bonus-inps", ["bonus", "inps", "previdenz", "pension"]),
    ("incentivi", ["agevolazione", "incentiv", "contribut"]),
    ("isee", ["isee", "welfare"]),
]

# Target-determination keywords
_TARGET_PERSONA_KW = ["persona", "cittadin", "contribuent", "lavorat"]
_TARGET_AZIENDA_KW = ["impresa", "aziend", "societa"]


class NormattivaRecentiScraper(BaseScraper):
    """Scraper for recent Italian legislation from Normattiva elencoPerData."""

    name = "normattiva_recenti"
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
    # fetch
    # ------------------------------------------------------------------
    def fetch(self) -> dict:
        """Fetch recent fiscal legislation acts from Normattiva by year.

        For each target year, downloads the list of acts, filters by fiscal
        keywords, and fetches the detail page for each matching act.

        Returns:
            Dict with 'articles' key containing list of article dicts,
            each with 'title', 'text', 'url', 'year' keys.
        """
        articles: list[dict] = []

        for year in TARGET_YEARS:
            try:
                year_articles = self._fetch_year(year)
                articles.extend(year_articles)
                logger.info(f"Anno {year}: {len(year_articles)} atti fiscali trovati")
            except Exception as e:
                logger.error(f"Errore nello scraping dell'anno {year}: {e}")
                continue

        # Deduplicate by URL
        seen_urls: set[str] = set()
        unique_articles: list[dict] = []
        for article in articles:
            url = article.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_articles.append(article)

        # Save raw data
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"normattiva_recenti_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(unique_articles, f, ensure_ascii=False, indent=2)
        logger.info(f"Salvati {len(unique_articles)} atti in {raw_path}")

        return {"articles": unique_articles}

    # ------------------------------------------------------------------
    # _fetch_year
    # ------------------------------------------------------------------
    def _fetch_year(self, year: int) -> list[dict]:
        """Fetch all fiscal acts for a given year.

        1. GET the year listing page (and paginate)
        2. Parse links to act detail pages
        3. Filter by fiscal keywords in title+description
        4. Fetch detail pages for matching acts
        """
        all_acts: list[dict] = []
        max_pages = 12  # safety limit

        for page_num in range(max_pages):
            if page_num == 0:
                url = f"{ELENCO_PER_DATA_URL}/anno/{year}"
            else:
                url = f"{ELENCO_PER_DATA_URL}/{page_num}"

            logger.info(f"Scaricamento elenco atti anno {year}, pagina {page_num + 1}: {url}")

            html = self._get_with_retries(url)
            if not html:
                logger.warning(f"Nessun contenuto ricevuto per {url}")
                break

            page_acts = self._parse_listing_page(html, year)
            logger.info(f"Anno {year}, pagina {page_num + 1}: {len(page_acts)} atti trovati")

            if not page_acts:
                break

            all_acts.extend(page_acts)
            time.sleep(REQUEST_DELAY)

        logger.info(f"Anno {year}: {len(all_acts)} atti totali trovati")

        # Filter by fiscal keywords in title OR description
        fiscal_acts = [
            act for act in all_acts
            if self._is_fiscal(act.get("title", "") + " " + act.get("description", ""))
        ]
        logger.info(f"Anno {year}: {len(fiscal_acts)} atti fiscali dopo il filtraggio")

        # Cap per year
        fiscal_acts = fiscal_acts[:MAX_ACTS_PER_YEAR]

        # Fetch detail pages
        for act in fiscal_acts:
            detail_url = act.get("url", "")
            if not detail_url:
                continue
            try:
                time.sleep(REQUEST_DELAY)
                full_text = self._fetch_detail_page(detail_url)
                if full_text:
                    act["text"] = full_text
            except Exception as e:
                logger.debug(f"Errore nel download di {detail_url}: {e}")

        return fiscal_acts

    # ------------------------------------------------------------------
    # _get_with_retries
    # ------------------------------------------------------------------
    def _get_with_retries(self, url: str) -> str | None:
        """GET a URL with up to MAX_RETRIES attempts.

        Returns the response text on success, None on failure.
        """
        for attempt in range(MAX_RETRIES):
            try:
                resp = self.session.get(url, timeout=30)
                resp.raise_for_status()
                return resp.text
            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} fallito per {url}: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
        return None

    # ------------------------------------------------------------------
    # _parse_listing_page
    # ------------------------------------------------------------------
    def _parse_listing_page(self, html: str, year: int) -> list[dict]:
        """Parse the elencoPerData listing page and extract act entries.

        Uses div.boxAtto containers (primary) or falls back to link-based
        extraction. Captures both title and description for keyword filtering.

        Returns a list of dicts with 'title', 'description', 'url', 'year', 'text' keys.
        """
        soup = BeautifulSoup(html, "html.parser")
        acts: list[dict] = []
        seen_urls: set[str] = set()

        # Strategy 1: parse boxAtto containers (most common format)
        boxes = soup.select("div.boxAtto")
        if boxes:
            for box in boxes:
                link = box.find("a", href=lambda h: h and "/atto/" in h)
                if not link:
                    continue

                href = link.get("href", "").strip()
                full_url = href if href.startswith("http") else f"{NORMATTIVA_BASE}{href}"
                if full_url in seen_urls:
                    continue
                seen_urls.add(full_url)

                title = link.get_text(separator=" ", strip=True)

                # Extract description from sibling paragraphs or text in box
                description = ""
                # Look for text in square brackets (common Normattiva pattern)
                box_text = box.get_text(separator=" ", strip=True)
                bracket_match = re.search(r"\[(.+?)\]", box_text, re.DOTALL)
                if bracket_match:
                    description = bracket_match.group(1).strip()
                else:
                    # Take all text from box minus the title
                    description = box_text.replace(title, "", 1).strip()

                if not title or len(title) < 5:
                    continue

                acts.append({
                    "title": title.strip(),
                    "description": description[:500],
                    "url": full_url,
                    "year": year,
                    "text": "",
                })
            return acts

        # Strategy 2: find all <a> tags with detail-page patterns
        detail_patterns = ["/atto/caricaDettaglioAtto", "/atto/vediAtto", "/uri-res/"]
        all_links = soup.find_all("a", href=True)
        for link in all_links:
            href = link.get("href", "").strip()
            if not any(pattern in href for pattern in detail_patterns):
                continue
            full_url = href if href.startswith("http") else f"{NORMATTIVA_BASE}{href}"
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            title = link.get_text(separator=" ", strip=True)
            if not title or len(title) < 5:
                parent = link.parent
                if parent:
                    title = parent.get_text(separator=" ", strip=True)
            if not title or len(title) < 5:
                continue

            acts.append({
                "title": title.strip(),
                "description": "",
                "url": full_url,
                "year": year,
                "text": "",
            })

        # Strategy 3: table rows fallback
        if not acts:
            acts = self._parse_listing_table(soup, year)

        return acts

    # ------------------------------------------------------------------
    # _parse_listing_table
    # ------------------------------------------------------------------
    def _parse_listing_table(self, soup: BeautifulSoup, year: int) -> list[dict]:
        """Fallback parser: extract acts from table rows.

        Some Normattiva listing pages render acts in <table> elements.
        """
        acts: list[dict] = []
        seen_urls: set[str] = set()

        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                link = row.find("a", href=True)
                if not link:
                    continue
                href = link.get("href", "").strip()
                if not href or href == "#":
                    continue

                full_url = href if href.startswith("http") else f"{NORMATTIVA_BASE}{href}"
                if full_url in seen_urls:
                    continue
                seen_urls.add(full_url)

                title = link.get_text(separator=" ", strip=True)
                # Also try to pick up text from sibling <td> elements
                if not title or len(title) < 5:
                    cells = row.find_all("td")
                    title = " ".join(
                        td.get_text(strip=True) for td in cells if td.get_text(strip=True)
                    )

                if not title or len(title) < 5:
                    continue

                acts.append({
                    "title": title.strip(),
                    "url": full_url,
                    "year": year,
                    "text": "",
                })

        return acts

    # ------------------------------------------------------------------
    # _parse_listing_generic
    # ------------------------------------------------------------------
    def _parse_listing_generic(self, soup: BeautifulSoup, year: int) -> list[dict]:
        """Last-resort parser: extract acts from list items or divs with links.

        Iterates over <li> or <div> elements that contain at least one <a>
        with an href pointing to a Normattiva page.
        """
        acts: list[dict] = []
        seen_urls: set[str] = set()

        containers = soup.find_all(["li", "div"], recursive=True)
        for container in containers:
            link = container.find("a", href=True)
            if not link:
                continue
            href = link.get("href", "").strip()
            if not href or href == "#":
                continue
            # Only keep links pointing to normattiva
            if "normattiva.it" not in href and not href.startswith("/"):
                continue

            full_url = href if href.startswith("http") else f"{NORMATTIVA_BASE}{href}"
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            title = container.get_text(separator=" ", strip=True)
            if not title or len(title) < 10:
                continue
            # Truncate overly long titles (likely we grabbed too much context)
            if len(title) > 500:
                title = link.get_text(separator=" ", strip=True)
            if not title or len(title) < 5:
                continue

            acts.append({
                "title": title.strip(),
                "url": full_url,
                "year": year,
                "text": "",
            })

        return acts

    # ------------------------------------------------------------------
    # _is_fiscal
    # ------------------------------------------------------------------
    @staticmethod
    def _is_fiscal(title: str) -> bool:
        """Check whether an act title contains at least one fiscal keyword."""
        title_lower = title.lower()
        return any(kw in title_lower for kw in FISCAL_KEYWORDS)

    # ------------------------------------------------------------------
    # _fetch_detail_page
    # ------------------------------------------------------------------
    def _fetch_detail_page(self, url: str) -> str | None:
        """Fetch a detail page and extract the full article text.

        Tries several known selectors for the article body.
        """
        html = self._get_with_retries(url)
        if not html:
            return None

        soup = BeautifulSoup(html, "html.parser")

        # Try selectors in order of specificity
        body_el = (
            soup.select_one(".bodyTesto")
            or soup.select_one("#testoAtto")
            or soup.select_one(".art-body")
            or soup.select_one("div.testo")
        )

        article_text = ""
        if body_el:
            article_text = body_el.get_text(separator="\n", strip=True)
        else:
            # Last resort: grab main content area, excluding nav/footer
            for tag in soup.select("nav, footer, header, script, style"):
                tag.decompose()
            main = (
                soup.select_one("main")
                or soup.select_one('[role="main"]')
                or soup.body
            )
            if main:
                article_text = main.get_text(separator="\n", strip=True)[:20000]

        # Save individual article HTML for audit trail
        try:
            safe_name = re.sub(r"[^a-zA-Z0-9_-]", "_", url.split("/")[-1])[:80]
            if not safe_name:
                safe_name = f"act_{int(time.time())}"
            article_path = os.path.join(OUTPUT_DIR, f"article_{safe_name}.html")
            with open(article_path, "w", encoding="utf-8") as f:
                f.write(html)
        except Exception as e:
            logger.debug(f"Impossibile salvare HTML articolo: {e}")

        return article_text if article_text else None

    # ------------------------------------------------------------------
    # _slugify
    # ------------------------------------------------------------------
    @staticmethod
    def _slugify(text: str, year: int) -> str:
        """Generate a URL-friendly slug from text.

        Format: ``normattiva-{year}-{slugified_title}``, max 80 chars.
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
        # Prefix with source and year, truncate
        prefix = f"normattiva-{year}-"
        max_slug_body = 80 - len(prefix)
        slug = f"{prefix}{slug[:max_slug_body]}"
        return slug

    # ------------------------------------------------------------------
    # _determine_category
    # ------------------------------------------------------------------
    @staticmethod
    def _determine_category(title: str, text: str) -> str:
        """Determine the rule category from keywords found in title and text.

        Checks title first (stronger signal), then text. Returns the first
        matching category or 'detrazioni' as default.
        """
        combined = f"{title} {text}".lower()
        for category, keywords in _CATEGORY_MAP:
            if any(kw in combined for kw in keywords):
                return category
        return "detrazioni"

    # ------------------------------------------------------------------
    # _determine_target
    # ------------------------------------------------------------------
    @staticmethod
    def _determine_target(text: str) -> str:
        """Determine the target audience from keywords in the text.

        Returns 'persona', 'azienda', or 'persona' as default.
        """
        text_lower = text.lower()
        has_persona = any(kw in text_lower for kw in _TARGET_PERSONA_KW)
        has_azienda = any(kw in text_lower for kw in _TARGET_AZIENDA_KW)

        if has_azienda and not has_persona:
            return "azienda"
        # Default to persona (also covers the case where both are found)
        return "persona"

    # ------------------------------------------------------------------
    # _extract_max_amount
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_max_amount(text: str) -> float | None:
        """Extract the largest euro amount from text within plausible range.

        Searches for patterns like '1000 euro', '1.500,00 euro', etc.
        Returns the largest value between 100 and 500000, or None.
        """
        matches = _EURO_PATTERN.findall(text)
        if not matches:
            return None

        amounts = []
        for raw in matches:
            # Normalize: remove dots used as thousands separator, replace comma with dot
            cleaned = raw.replace(".", "").replace(",", ".")
            try:
                value = float(cleaned)
                if 100 <= value <= 500_000:
                    amounts.append(value)
            except ValueError:
                continue

        return max(amounts) if amounts else None

    # ------------------------------------------------------------------
    # extract
    # ------------------------------------------------------------------
    def extract(self, raw_data: dict) -> list[dict]:
        """Extract structured rules from fetched Normattiva articles.

        Builds rule dicts using direct text parsing -- no external API.

        Args:
            raw_data: Dict with 'articles' key containing scraped acts.

        Returns:
            List of rule dicts in standard format.
        """
        articles = raw_data.get("articles", [])
        if not articles:
            logger.warning("Nessun articolo da analizzare")
            return []

        all_rules: list[dict] = []

        for article in articles:
            title = article.get("title", "").strip()
            text = article.get("text", "").strip()
            year = article.get("year", 2025)

            if not title:
                continue

            # Use title as fallback text if detail page text is missing/short
            effective_text = text if len(text) >= 50 else title

            slug = self._slugify(title, year)
            category = self._determine_category(title, effective_text)
            target = self._determine_target(effective_text)
            max_amount = self._extract_max_amount(effective_text)

            # Build short description from the act text
            short_desc = effective_text[:500].strip()
            # Build full description (capped)
            full_desc = effective_text[:3000].strip()

            rule = {
                "slug": slug,
                "name": title[:200],
                "shortDescription": short_desc,
                "fullDescription": full_desc,
                "category": category,
                "target": target,
                "certaintyLevel": "certo",
                "sourceName": "Normattiva - Atti Recenti",
                "maxAmount": max_amount,
                "howToClaim": "",
                "requiredDocs": [],
                "tags": ["legislazione", f"anno-{year}"],
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

        # Save extracted rules
        extracted_dir = os.path.join(
            os.path.dirname(__file__), "..", "outputs", "extracted",
        )
        save_rules_json(
            unique_rules,
            os.path.join(
                extracted_dir,
                f"normattiva_recenti_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole estratte da Normattiva Recenti: {len(unique_rules)}")
        return unique_rules

    # ------------------------------------------------------------------
    # diff
    # ------------------------------------------------------------------
    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries.

        Uses DiffChecker with sourceName 'Normattiva - Atti Recenti'.
        """
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
