"""Normattiva.it scraper for Italian legislation.

Scrapes recent legislation from normattiva.it advanced search, searching for
fiscal keywords (detrazione fiscale, bonus fiscale, agevolazione fiscale).
Parses article text directly into structured rule dicts.

The search is form-based (POST to /ricerca/avanzata) and results are
server-side rendered HTML.  A session must be established first via GET
to obtain the server cookie before POSTing the search form.

Schedule: weekly
Categories: detrazioni, bonus-inps
"""
import sys
import os
import json
import re
import time
import logging
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from bs4 import BeautifulSoup

from base import BaseScraper
from config import SOURCES
from extractors.rule_extractor import save_rules_json
from extractors.diff_checker import DiffChecker

logger = logging.getLogger(__name__)

USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "normattiva")

# Focused fiscal keywords (3 terms to keep volume manageable)
FISCAL_KEYWORDS = [
    "detrazione fiscale",
    "bonus fiscale",
    "agevolazione fiscale",
]

# Normattiva endpoints
NORMATTIVA_SEARCH_URL = "https://www.normattiva.it/ricerca/avanzata"
NORMATTIVA_BASE = "https://www.normattiva.it"

# Maximum number of retries for HTTP calls
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Limits
MAX_RESULTS_PER_KEYWORD = 30
MAX_DETAIL_FETCHES_PER_KEYWORD = 15

# Keyword-to-category mapping
_BONUS_KEYWORDS = {"bonus fiscale"}

# Regex pattern for extracting euro amounts
_EURO_PATTERN = re.compile(r"(\d[\d.]*(?:[.,]\d+)?)\s*euro", re.IGNORECASE)


class NormattivaScraper(BaseScraper):
    """Scraper for Italian legislation via Normattiva."""

    name = "normattiva"
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
        """Fetch latest legal updates from Normattiva.

        Searches for recent legislation containing fiscal keywords.

        Returns:
            Dict with 'articles' key containing list of article dicts,
            each with 'title', 'text', 'description', 'url', 'date',
            'gu', 'keyword' keys.
        """
        articles: list[dict] = []

        for keyword in FISCAL_KEYWORDS:
            try:
                keyword_articles = self._search_keyword(keyword)
                articles.extend(keyword_articles)
                logger.info(f"Trovati {len(keyword_articles)} risultati per '{keyword}'")
                # Be polite with the server
                time.sleep(2)
            except Exception as e:
                logger.error(f"Errore nella ricerca per '{keyword}': {e}")
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
            f"normattiva_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(unique_articles, f, ensure_ascii=False, indent=2)
        logger.info(f"Salvati {len(unique_articles)} articoli in {raw_path}")

        return {"articles": unique_articles}

    # ------------------------------------------------------------------
    # _establish_session
    # ------------------------------------------------------------------
    def _establish_session(self) -> str | None:
        """GET the advanced search page to obtain session cookies.

        Returns the ``tabID`` hidden field value needed for the POST,
        or *None* on failure.
        """
        try:
            resp = self.session.get(NORMATTIVA_SEARCH_URL, timeout=30)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            tab_input = soup.find("input", {"name": "tabID"})
            tab_id = tab_input["value"] if tab_input else None
            return tab_id
        except Exception as e:
            logger.warning(f"Impossibile stabilire la sessione: {e}")
            return None

    # ------------------------------------------------------------------
    # _search_keyword
    # ------------------------------------------------------------------
    def _search_keyword(self, keyword: str) -> list[dict]:
        """Search Normattiva for a specific keyword.

        1. GET /ricerca/avanzata to get cookies + tabID
        2. POST the search form
        3. Parse results from the HTML response
        4. Follow up to MAX_DETAIL_FETCHES_PER_KEYWORD detail links
        """
        articles: list[dict] = []

        for attempt in range(MAX_RETRIES):
            try:
                # Step 1 -- establish session
                tab_id = self._establish_session()
                if not tab_id:
                    logger.warning("Nessun tabID ottenuto, uso valore casuale")
                    import random
                    tab_id = f"0.{random.random()}"

                # Step 2 -- POST the search form
                form_data = {
                    "tabID": tab_id,
                    "title": "lbl.risultatoRicerca",
                    "numeroProvvedimento": "",
                    "giornoProvvedimento": "",
                    "meseProvvedimento": "",
                    "annoProvvedimento": "",
                    "numeroArticolo": "0",
                    "denominazioneAtto": "",
                    "titoloContainsType": "ALL_WORDS",
                    "titoloRicerca": "",
                    "titoloNot": "",
                    "testoContainsType": "ALL_WORDS",
                    "testoRicerca": keyword,
                    "testoNot": "",
                    "inizioGiornoPubProvvedimento": "",
                    "inizioMesePubProvvedimento": "",
                    "inizioAnnoPubProvvedimento": "",
                    "fineGiornoPubProvvedimento": "",
                    "fineMesePubProvvedimento": "",
                    "fineAnnoPubProvvedimento": "",
                }

                response = self.session.post(
                    NORMATTIVA_SEARCH_URL,
                    data=form_data,
                    timeout=30,
                )
                response.raise_for_status()

                # Step 3 -- parse first page of results
                page_articles = self._parse_search_page(response.text, keyword)
                articles.extend(page_articles)

                # Step 3b -- fetch page 2 if we still want more results
                if len(articles) < MAX_RESULTS_PER_KEYWORD:
                    time.sleep(1)
                    try:
                        page2_resp = self.session.get(
                            f"{NORMATTIVA_BASE}/ricerca/avanzata/1",
                            timeout=30,
                        )
                        page2_resp.raise_for_status()
                        page2_articles = self._parse_search_page(
                            page2_resp.text, keyword,
                        )
                        articles.extend(page2_articles)
                    except Exception as e:
                        logger.debug(f"Pagina 2 non disponibile: {e}")

                # Enforce cap
                articles = articles[:MAX_RESULTS_PER_KEYWORD]

                # Step 4 -- fetch detail pages for articles that have a URL
                detail_count = 0
                for article in articles:
                    if detail_count >= MAX_DETAIL_FETCHES_PER_KEYWORD:
                        break
                    href = article.get("url", "")
                    if not href:
                        continue
                    try:
                        time.sleep(1)
                        full_text = self._fetch_detail_page(href)
                        if full_text:
                            article["text"] = full_text
                        detail_count += 1
                    except Exception as e:
                        logger.debug(f"Errore nel download di {href}: {e}")

                break  # success, exit retry loop

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} fallito per '{keyword}': {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue

        return articles

    # ------------------------------------------------------------------
    # _parse_search_page
    # ------------------------------------------------------------------
    def _parse_search_page(self, html: str, keyword: str) -> list[dict]:
        """Parse a single page of search results.

        The Normattiva result page renders each result inside a
        ``div.boxAtto`` containing:
        - a ``<p>`` with an ``<a>`` whose href includes
          ``/atto/caricaDettaglioAtto`` (the law title)
        - a second ``<p>`` with the description in square brackets
        - a ``<span class="DateGU">`` with the Gazzetta Ufficiale ref
        """
        soup = BeautifulSoup(html, "html.parser")
        articles: list[dict] = []

        # Primary strategy: find all .boxAtto containers
        result_boxes = soup.select("div.boxAtto")

        if not result_boxes:
            # Fallback: find all links pointing to detail pages
            detail_links = soup.find_all(
                "a", href=lambda h: h and "/atto/caricaDettaglioAtto" in h
            )
            for link in detail_links:
                article = self._parse_result_from_link(link, keyword)
                if article:
                    articles.append(article)
            return articles

        for box in result_boxes:
            article = self._parse_search_result(box, keyword)
            if article:
                articles.append(article)

        return articles

    # ------------------------------------------------------------------
    # _parse_search_result
    # ------------------------------------------------------------------
    def _parse_search_result(self, box, keyword: str) -> dict | None:
        """Parse a single ``div.boxAtto`` result container.

        Returns an article dict or None if parsing fails.
        """
        # Find the detail link
        link = box.find(
            "a",
            href=lambda h: h and "/atto/caricaDettaglioAtto" in h,
        )
        if not link:
            return None

        title = link.get_text(separator=" ", strip=True)
        if not title:
            return None

        href = link.get("href", "").strip()
        if href and not href.startswith("http"):
            href = f"{NORMATTIVA_BASE}{href}"

        # Extract description -- the second <p> inside the collapse-header
        header = box.select_one(".collapse-header") or box
        paragraphs = header.find_all("p")
        description = ""
        for p in paragraphs:
            # Skip the paragraph containing the link (it's the title)
            if p.find("a", href=lambda h: h and "/atto/caricaDettaglioAtto" in h):
                continue
            p_text = p.get_text(strip=True)
            if p_text:
                # Strip surrounding square brackets
                description = p_text.strip("[] ")
                break

        # Extract GU reference
        gu_span = box.select_one("span.DateGU")
        gu_ref = gu_span.get_text(strip=True) if gu_span else ""

        # Try to extract a date from the GU reference
        article_date = self._extract_date_from_gu(gu_ref)

        return {
            "title": title,
            "text": description or title,  # will be replaced by full text later
            "description": description,
            "url": href,
            "date": article_date,
            "gu": gu_ref,
            "keyword": keyword,
        }

    # ------------------------------------------------------------------
    # _parse_result_from_link  (fallback)
    # ------------------------------------------------------------------
    def _parse_result_from_link(self, link, keyword: str) -> dict | None:
        """Fallback parser when .boxAtto is not found.

        Extracts data directly from an ``<a>`` tag pointing to a detail
        page and its surrounding context.
        """
        title = link.get_text(separator=" ", strip=True)
        if not title:
            return None

        href = link.get("href", "").strip()
        if href and not href.startswith("http"):
            href = f"{NORMATTIVA_BASE}{href}"

        # Try to grab sibling text for description
        parent = link.parent
        description = ""
        if parent:
            for sibling in parent.find_next_siblings(limit=2):
                text = sibling.get_text(strip=True)
                if text and text != title:
                    description = text.strip("[] ")
                    break

        return {
            "title": title,
            "text": description or title,
            "description": description,
            "url": href,
            "date": datetime.now().isoformat(),
            "gu": "",
            "keyword": keyword,
        }

    # ------------------------------------------------------------------
    # _fetch_detail_page
    # ------------------------------------------------------------------
    def _fetch_detail_page(self, url: str) -> str | None:
        """Fetch a detail page and extract the full article text.

        Tries several known selectors for the article body and saves
        the raw HTML for audit purposes.
        """
        resp = self.session.get(url, timeout=30)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

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
            main = soup.select_one("main") or soup.select_one('[role="main"]') or soup.body
            if main:
                article_text = main.get_text(separator="\n", strip=True)[:20000]

        # Save individual article HTML for audit trail
        try:
            # Build a safe filename from the codiceRedazionale param
            safe_name = "unknown"
            if "codiceRedazionale=" in url:
                safe_name = url.split("codiceRedazionale=")[1].split("&")[0]
            article_path = os.path.join(OUTPUT_DIR, f"article_{safe_name}.html")
            with open(article_path, "w", encoding="utf-8") as f:
                f.write(resp.text)
        except Exception as e:
            logger.debug(f"Impossibile salvare HTML articolo: {e}")

        return article_text if article_text else None

    # ------------------------------------------------------------------
    # _extract_date_from_gu
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_date_from_gu(gu_ref: str) -> str:
        """Extract a date string from a GU reference like
        '(GU n. 123 del 28-05-2024)'.

        Returns ISO-formatted date or current datetime if parsing fails.
        """
        match = re.search(r"del\s+(\d{2})-(\d{2})-(\d{4})", gu_ref)
        if match:
            day, month, year = match.groups()
            try:
                dt = datetime(int(year), int(month), int(day))
                return dt.isoformat()
            except ValueError:
                pass
        return datetime.now().isoformat()

    # ------------------------------------------------------------------
    # _slugify
    # ------------------------------------------------------------------
    @staticmethod
    def _slugify(text: str) -> str:
        """Generate a URL-friendly slug from text.

        Lowercases, replaces spaces with hyphens, strips special characters,
        prefixes with 'normattiva-', and limits to 60 characters.
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
        slug = f"normattiva-{slug}"
        return slug[:60]

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
        """Extract rules from Normattiva articles by direct text parsing.

        For each article, builds a structured rule dict from the article
        title, text, and keyword metadata without calling any external API.

        Args:
            raw_data: Dict with 'articles' key containing scraped legislation.

        Returns:
            List of rule dicts in standard format.
        """
        articles = raw_data.get("articles", [])
        if not articles:
            logger.warning("Nessun articolo da analizzare")
            return []

        all_rules = []

        for article in articles:
            text = article.get("text", "")
            keyword = article.get("keyword", "")
            title = article.get("title", "")
            description = article.get("description", "")

            if not text or len(text.strip()) < 200:
                continue

            # Determine category based on keyword
            if keyword in _BONUS_KEYWORDS:
                category = "bonus-inps"
            else:
                category = "detrazioni"

            slug = self._slugify(title)
            max_amount = self._extract_max_amount(text)

            # Build a short description from the article description or text
            short_desc = description if description else text[:200]

            tags = ["legislazione"]
            if keyword and keyword not in tags:
                tags.append(keyword)

            rule = {
                "slug": slug,
                "name": title[:100],
                "shortDescription": short_desc[:200],
                "fullDescription": text[:2000],
                "category": category,
                "target": "persona",
                "certaintyLevel": "certo",
                "sourceName": "Normattiva",
                "maxAmount": max_amount,
                "howToClaim": "",
                "requiredDocs": [],
                "tags": tags,
                "requirements": [],
            }

            all_rules.append(rule)
            logger.info(f"Estratta regola '{slug}' da '{title}'")

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
            os.path.dirname(__file__), "..", "outputs", "extracted"
        )
        save_rules_json(
            unique_rules,
            os.path.join(
                extracted_dir,
                f"normattiva_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole estratte da Normattiva: {len(unique_rules)}")
        return unique_rules

    # ------------------------------------------------------------------
    # diff
    # ------------------------------------------------------------------
    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries."""
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
