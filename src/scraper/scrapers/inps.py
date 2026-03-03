"""INPS social security scraper for benefits and services.

Scrapes INPS "Prestazioni e servizi" section pages for key benefits
(Assegno Unico, NASpI, bonus nido, etc.). Parses scraped HTML content
directly into structured rules using regex-based text extraction.

Schedule: monthly
Category: bonus-inps
"""
import re
import sys
import os
import json
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

USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "inps")

# INPS base and key URLs
INPS_BASE = "https://www.inps.it"
INPS_PRESTAZIONI_URL = "https://www.inps.it/prestazioni-servizi"

# Key INPS benefit pages to scrape
INPS_BENEFIT_PAGES = [
    {
        "slug": "assegno-unico-universale",
        "name": "Assegno Unico e Universale",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.assegno-unico-e-universale-per-i-figli-a-carico-55984.assegno-unico-e-universale-per-i-figli-a-carico.html",
        "alt_urls": [],
    },
    {
        "slug": "naspi",
        "name": "NASpI - Indennita' di Disoccupazione",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.50593.naspi-indennit-mensile-di-disoccupazione.html",
        "alt_urls": [],
    },
    {
        "slug": "bonus-asilo-nido",
        "name": "Bonus Asilo Nido",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.bonus-asilo-nido-e-forme-di-supporto-presso-la-propria-abitazione-51105.bonus-asilo-nido-e-forme-di-supporto-presso-la-propria-abitazione.html",
        "alt_urls": [],
    },
    {
        "slug": "congedo-parentale",
        "name": "Congedo Parentale",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.50583.indennit-di-congedo-parentale-per-lavoratrici-e-lavoratori-dipendenti.html",
        "alt_urls": [],
    },
    {
        "slug": "bonus-mamme",
        "name": "Nuovo Bonus Mamme Lavoratrici",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.nuovo-bonus-mamme.html",
        "alt_urls": [],
    },
    {
        "slug": "pensione-anticipata",
        "name": "Pensione Anticipata",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.pensione-anticipata-50308.pensione-anticipata.html",
        "alt_urls": [],
    },
    {
        "slug": "assegno-inclusione",
        "name": "Assegno di Inclusione (ADI)",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.assegno-di-inclusione-adi.html",
        "alt_urls": [],
    },
    {
        "slug": "maternita-stato",
        "name": "Indennita' di Maternita'",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.indennit-di-maternit-paternit-per-lavoratrici-e-lavoratori-autonomi-50585.indennit-di-maternit-paternit-per-lavoratrici-e-lavoratori-autonomi.html",
        "alt_urls": [],
    },
    {
        "slug": "supporto-formazione-lavoro",
        "name": "Supporto Formazione e Lavoro",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.supporto-per-la-formazione-e-il-lavoro-sfl-.html",
        "alt_urls": [],
    },
    {
        "slug": "bonus-nuovi-nati",
        "name": "Bonus Nuovi Nati",
        "url": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.bonus-nuovi-nati.html",
        "alt_urls": [],
    },
]

# INPS circolari (news) section
INPS_CIRCOLARI_URL = "https://www.inps.it/it/it/inps-comunica/notizie.html"

MAX_RETRIES = 3
RETRY_DELAY = 5


class INPSScraper(BaseScraper):
    """Scraper for INPS benefits and services."""

    name = "inps"
    source_url = SOURCES.get("inps", "https://www.inps.it")

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
        })
        self._diff_checker = DiffChecker()
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    def fetch(self) -> dict:
        """Fetch benefit pages and circolari from INPS.

        Returns:
            Dict with 'benefits' (list of scraped benefit pages)
            and 'circolari' (list of recent circolari).
        """
        benefits = []
        circolari = []

        # Fetch each known benefit page
        for benefit_config in INPS_BENEFIT_PAGES:
            try:
                benefit_data = self._fetch_benefit_page(benefit_config)
                if benefit_data:
                    benefits.append(benefit_data)
                    logger.info(f"Recuperata pagina: {benefit_config['name']}")
                time.sleep(2)
            except Exception as e:
                logger.error(
                    f"Errore nel recupero di {benefit_config['name']}: {e}"
                )
                continue

        # Fetch recent circolari for updates
        try:
            circolari = self._fetch_circolari()
            logger.info(f"Recuperate {len(circolari)} circolari recenti")
        except Exception as e:
            logger.error(f"Errore nel recupero circolari: {e}")

        # Save raw data
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"inps_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(
                {"benefits": benefits, "circolari": circolari},
                f,
                ensure_ascii=False,
                indent=2,
            )

        return {"benefits": benefits, "circolari": circolari}

    def _fetch_benefit_page(self, config: dict) -> dict | None:
        """Fetch a single INPS benefit page."""
        urls_to_try = [config["url"]] + config.get("alt_urls", [])

        for url in urls_to_try:
            for attempt in range(MAX_RETRIES):
                try:
                    response = self.session.get(url, timeout=30)
                    response.raise_for_status()

                    soup = BeautifulSoup(response.text, "html.parser")

                    # Save raw HTML
                    safe_slug = config["slug"][:40]
                    html_path = os.path.join(OUTPUT_DIR, f"{safe_slug}.html")
                    with open(html_path, "w", encoding="utf-8") as f:
                        f.write(response.text)

                    # Extract the main content
                    content_el = (
                        soup.select_one(".field--name-body")
                        or soup.select_one(".content-scheda")
                        or soup.select_one(".field-items")
                        or soup.select_one(".scheda-prestazione")
                        or soup.select_one("#content-detail")
                        or soup.select_one("article")
                        or soup.select_one("main")
                    )

                    if content_el:
                        text = content_el.get_text(separator="\n", strip=True)
                        html_content = str(content_el)
                    else:
                        text = soup.get_text(separator="\n", strip=True)[:30000]
                        html_content = response.text[:50000]

                    # Try to extract specific data points
                    data_points = self._extract_data_points(text)

                    return {
                        "slug": config["slug"],
                        "name": config["name"],
                        "url": url,
                        "text": text[:50000],
                        "html": html_content[:50000],
                        "data_points": data_points,
                    }

                except requests.exceptions.RequestException as e:
                    logger.warning(
                        f"Tentativo {attempt + 1}/{MAX_RETRIES} fallito per {url}: {e}"
                    )
                    if attempt < MAX_RETRIES - 1:
                        time.sleep(RETRY_DELAY * (attempt + 1))
                    continue

        return None

    def _extract_data_points(self, text: str) -> dict:
        """Extract key data points from benefit page text using regex."""
        import re

        data = {}

        # ISEE thresholds
        isee_patterns = [
            r"ISEE.*?(?:fino a|inferiore a|non superiore a)\s*(?:euro\s*)?(\d+[\.\d]*(?:[.,]\d+)?)\s*(?:euro)?",
            r"(\d+[\.\d]*(?:[.,]\d+)?)\s*euro.*?ISEE",
            r"ISEE.*?(\d{1,2}[\.\d]*)\s*(?:euro|EUR)",
        ]
        for pattern in isee_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                cleaned = []
                for m in matches:
                    val = m.replace(".", "").replace(",", ".")
                    try:
                        v = float(val)
                        if 1000 <= v <= 100000:
                            cleaned.append(v)
                    except ValueError:
                        continue
                if cleaned:
                    data["isee_thresholds"] = sorted(set(cleaned))
                    break

        # Monthly/annual amounts
        amount_patterns = [
            r"importo.*?(\d+[\.\d]*(?:[.,]\d+)?)\s*euro\s*(?:mensil|al mese)",
            r"(\d+[\.\d]*(?:[.,]\d+)?)\s*euro\s*(?:mensil|al mese|/mese)",
            r"importo\s+massimo.*?(\d+[\.\d]*(?:[.,]\d+)?)\s*euro",
            r"fino\s+a\s+(\d+[\.\d]*(?:[.,]\d+)?)\s*euro",
        ]
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                amounts = []
                for m in matches:
                    val = m.replace(".", "").replace(",", ".")
                    try:
                        v = float(val)
                        if 10 <= v <= 50000:
                            amounts.append(v)
                    except ValueError:
                        continue
                if amounts:
                    data["amounts"] = sorted(set(amounts))
                    break

        # Deadlines
        deadline_patterns = [
            r"scadenza.*?(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})",
            r"entro\s+il\s+(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})",
            r"termine.*?(\d{1,2}\s+\w+\s+\d{4})",
        ]
        for pattern in deadline_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data["deadline"] = match.group(1)
                break

        return data

    def _fetch_circolari(self) -> list[dict]:
        """Fetch recent INPS circolari for benefit updates."""
        circolari = []

        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(INPS_CIRCOLARI_URL, timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")

                # Look for circolare entries
                items = soup.select(
                    ".circolare-item, .news-item, .result-item, "
                    "article, .views-row"
                )

                if not items:
                    items = soup.find_all("div", class_=lambda c: (
                        c and any(kw in c.lower() for kw in ["circolar", "messag", "item"])
                    ))

                # Also try list items
                if not items:
                    items = soup.select("ul li, .list-group-item")

                for item in items[:30]:
                    title_el = item.find(["h2", "h3", "h4", "a", "strong"])
                    if not title_el:
                        continue

                    title = title_el.get_text(strip=True)
                    if not title or len(title) < 10:
                        continue

                    # Filter for relevant circolari
                    relevant_keywords = [
                        "assegno", "bonus", "maternita", "naspi", "disoccupaz",
                        "nido", "detraz", "agevolaz", "isee", "congedo",
                        "inclusione", "invalidita", "accompagnamento",
                        "pensione", "famil",
                    ]
                    if not any(kw in title.lower() for kw in relevant_keywords):
                        continue

                    link_el = item.find("a", href=True)
                    href = ""
                    if link_el:
                        href = urljoin(INPS_CIRCOLARI_URL, link_el.get("href", ""))

                    date_el = item.find(
                        "span",
                        class_=lambda c: c and "dat" in c.lower()
                    ) if item else None
                    date_str = date_el.get_text(strip=True) if date_el else ""

                    circolari.append({
                        "title": title,
                        "url": href,
                        "date": date_str,
                        "text": item.get_text(separator="\n", strip=True)[:3000],
                    })

                break

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo circolari {attempt + 1}/{MAX_RETRIES} fallito: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
                continue

        return circolari

    # Tag mapping for specific benefit slugs
    SLUG_TAGS = {
        "assegno-unico-universale": ["famiglia", "figli"],
        "naspi": ["disoccupazione", "lavoro"],
        "bonus-asilo-nido": ["famiglia", "figli", "nido"],
        "congedo-parentale": ["famiglia", "maternità"],
        "bonus-mamme": ["famiglia", "maternità", "lavoro"],
        "pensione-anticipata": ["pensione"],
        "assegno-inclusione": ["inclusione", "povertà"],
        "maternita-stato": ["famiglia", "maternità"],
        "supporto-formazione-lavoro": ["lavoro", "formazione"],
        "bonus-nuovi-nati": ["famiglia", "figli", "neonati"],
    }

    def extract(self, raw_data: dict) -> list[dict]:
        """Extract rules from INPS benefit pages using direct HTML text parsing.

        For each benefit page, parses the text content directly into
        structured rule dicts without external API calls.
        """
        benefits = raw_data.get("benefits", [])
        circolari = raw_data.get("circolari", [])

        if not benefits:
            logger.warning("Nessun dato benefici INPS da analizzare")
            return []

        all_rules = []

        # Extract rules from benefit pages via direct text parsing
        for benefit in benefits:
            slug = benefit.get("slug", "")
            name = benefit.get("name", "")
            text_content = benefit.get("text", "")
            data_points = benefit.get("data_points", {})

            if not text_content or len(text_content.strip()) < 100:
                continue

            try:
                rule = self._build_rule_from_benefit(
                    slug, name, text_content, data_points
                )
                all_rules.append(rule)
                logger.info(f"Estratta regola da '{name}'")
            except Exception as e:
                logger.error(f"Errore nell'estrazione da '{name}': {e}")
                continue

        # Skip circolari - they cannot be reliably parsed without Claude API
        if circolari:
            logger.info(
                f"Skipping {len(circolari)} circolari (no Claude extraction)"
            )

        # Deduplicate by slug
        seen_slugs = set()
        unique_rules = []
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
                f"inps_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole estratte da INPS: {len(unique_rules)}")
        return unique_rules

    def _build_rule_from_benefit(
        self, slug: str, name: str, text_content: str, data_points: dict
    ) -> dict:
        """Build a structured rule dict from a benefit's text content."""
        short_description = text_content[:300].strip()
        full_description = text_content[:3000].strip()

        # Determine maxAmount from data_points or regex fallback
        max_amount = None
        if data_points.get("amounts"):
            max_amount = max(data_points["amounts"])
        else:
            amount_matches = re.findall(
                r"(\d+[\.\d]*(?:[.,]\d+)?)\s*euro", text_content, re.IGNORECASE
            )
            if amount_matches:
                parsed_amounts = []
                for m in amount_matches:
                    val = m.replace(".", "").replace(",", ".")
                    try:
                        parsed_amounts.append(float(val))
                    except ValueError:
                        continue
                if parsed_amounts:
                    max_amount = max(parsed_amounts)

        # Extract howToClaim by searching for known phrases
        how_to_claim = ""
        claim_patterns = [
            r"(come fare domanda)",
            r"(come richiedere)",
            r"(presentare domanda)",
        ]
        text_lower = text_content.lower()
        for pattern in claim_patterns:
            match = re.search(pattern, text_lower)
            if match:
                start = match.start()
                how_to_claim = text_content[start : start + 500].strip()
                break

        # Build tags
        tags = ["inps"] + self.SLUG_TAGS.get(slug, [])

        # Build requirements
        requirements = []
        if data_points.get("isee_thresholds"):
            max_isee = max(data_points["isee_thresholds"])
            requirements.append({
                "field": "iseeRange",
                "operator": "lte",
                "value": str(int(max_isee)),
                "isRequired": False,
            })
        if slug == "assegno-unico-universale":
            requirements.append({
                "field": "hasChildren",
                "operator": "eq",
                "value": "true",
                "isRequired": True,
            })
        if slug == "naspi":
            requirements.append({
                "field": "employmentStatus",
                "operator": "eq",
                "value": "disoccupato",
                "isRequired": True,
            })

        rule = {
            "slug": slug,
            "name": name,
            "shortDescription": short_description,
            "fullDescription": full_description,
            "category": "bonus-inps",
            "target": "persona",
            "certaintyLevel": "certo",
            "sourceName": "INPS",
            "tags": tags,
            "requirements": requirements,
            "requiredDocs": [],
        }

        if max_amount is not None:
            rule["maxAmount"] = max_amount
        if how_to_claim:
            rule["howToClaim"] = how_to_claim

        return rule

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries."""
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
