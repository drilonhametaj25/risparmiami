"""Agenzia delle Entrate scraper for tax agency HTML guides.

Scrapes the fiscal guides section of agenziaentrate.gov.it, fetches HTML guide
pages about house bonuses, energy savings, and restructuring, then extracts text
and builds detrazioni/agevolazioni rules via direct HTML parsing.

Schedule: monthly
Category: detrazioni
"""
import sys
import os
import re
import json
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
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "agenzia_entrate")

# Main guide listing page
GUIDE_URL = "https://www.agenziaentrate.gov.it/portale/agenzia/agenzia-comunica/prodotti-editoriali/guide-fiscali/agenzia-informa"

# Known individual guide pages (HTML, not PDF)
KNOWN_GUIDE_PAGES = [
    {
        "slug": "ade-ristrutturazioni-edilizie",
        "name": "Ristrutturazioni Edilizie: le Agevolazioni Fiscali",
        "url": "https://www.agenziaentrate.gov.it/portale/ristrutturazioni-edilizie-le-agevolazioni-fiscali",
    },
    {
        "slug": "ade-risparmio-energetico",
        "name": "Risparmio Energetico: le Agevolazioni Fiscali",
        "url": "https://www.agenziaentrate.gov.it/portale/le-agevolazioni-fiscali-per-il-risparmio-energetico",
    },
    {
        "slug": "ade-bonus-mobili",
        "name": "Bonus Mobili ed Elettrodomestici",
        "url": "https://www.agenziaentrate.gov.it/portale/bonus-mobili",
    },
    {
        "slug": "ade-agevolazioni-disabili",
        "name": "Agevolazioni Fiscali per Persone con Disabilita'",
        "url": "https://www.agenziaentrate.gov.it/portale/le-agevolazioni-fiscali-per-le-persone-con-disabilita",
    },
    {
        "slug": "ade-detrazioni-casa",
        "name": "Scheda Detrazioni Ristrutturazione Edilizia",
        "url": "https://www.agenziaentrate.gov.it/portale/aree-tematiche/casa/agevolazioni/agevolazioni-per-le-ristrutturazioni-edilizie",
    },
]

# Keywords for tag detection from title
TAG_KEYWORDS = [
    "ristrutturazione",
    "ecobonus",
    "superbonus",
    "bonus-mobili",
    "bonus-verde",
    "bonus-facciate",
    "sismabonus",
    "bonus-casa",
    "risparmio-energetico",
    "bonus-barriere",
    "agevolazioni-disabili",
    "bonus-edilizi",
]

MAX_RETRIES = 3
RETRY_DELAY = 5


class AgenziaEntrateScraper(BaseScraper):
    """Scraper for Agenzia delle Entrate HTML guides."""

    name = "agenzia_entrate"
    source_url = SOURCES.get("agenzia_entrate", "https://www.agenziaentrate.gov.it")

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
        """Fetch fiscal guide pages from Agenzia delle Entrate.

        Scrapes the HTML content of known guide pages.

        Returns:
            Dict with 'guides' key containing list of dicts with
            'slug', 'name', 'url', 'text', 'html' keys.
        """
        guides = []

        for guide_config in KNOWN_GUIDE_PAGES:
            try:
                guide_data = self._fetch_guide_page(guide_config)
                if guide_data:
                    guides.append(guide_data)
                    logger.info(f"Recuperata guida: {guide_config['name']}")
                time.sleep(2)
            except Exception as e:
                logger.error(f"Errore nel recupero di {guide_config['name']}: {e}")
                continue

        # Save raw data
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"agenzia_entrate_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(
                [{"slug": g["slug"], "name": g["name"], "url": g["url"],
                  "text_length": len(g.get("text", ""))} for g in guides],
                f, ensure_ascii=False, indent=2,
            )

        return {"guides": guides}

    def _fetch_guide_page(self, config: dict) -> dict | None:
        """Fetch a single guide HTML page."""
        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(config["url"], timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")

                # Save raw HTML
                safe_slug = config["slug"][:40]
                html_path = os.path.join(OUTPUT_DIR, f"{safe_slug}.html")
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(response.text)

                # Extract the main content
                content_el = (
                    soup.select_one(".journal-content-article")
                    or soup.select_one(".asset-content")
                    or soup.select_one(".portlet-body")
                    or soup.select_one("article")
                    or soup.select_one("main")
                    or soup.select_one("#content")
                )

                if content_el:
                    text = content_el.get_text(separator="\n", strip=True)
                    html_content = str(content_el)
                else:
                    text = soup.get_text(separator="\n", strip=True)[:30000]
                    html_content = response.text[:50000]

                return {
                    "slug": config["slug"],
                    "name": config["name"],
                    "url": config["url"],
                    "text": text[:50000],
                    "html": html_content[:50000],
                }

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} fallito per {config['url']}: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue

        return None

    @staticmethod
    def _slugify(text: str) -> str:
        """Generate a URL-friendly slug from text.

        Lowercases, replaces spaces with hyphens, removes special characters,
        prefixes with 'ade-', and limits to 60 characters.
        """
        slug = text.lower().strip()
        # Replace spaces and underscores with hyphens
        slug = re.sub(r"[\s_]+", "-", slug)
        # Remove characters that are not alphanumeric or hyphens
        slug = re.sub(r"[^a-z0-9-]", "", slug)
        # Collapse multiple consecutive hyphens
        slug = re.sub(r"-{2,}", "-", slug)
        # Strip leading/trailing hyphens
        slug = slug.strip("-")
        # Prefix and limit length
        slug = f"ade-{slug}"
        return slug[:60]

    @staticmethod
    def _extract_max_amount(text: str) -> float | None:
        """Extract the maximum amount in euros from text.

        Searches for patterns like 'fino a 96.000 euro', 'importo massimo 10.000 euro',
        'limite 48.000 euro', 'spesa massima 5.000 euro'.
        Returns the largest value found between 100 and 500000, or None.
        """
        patterns = [
            r"fino\s+a\s+(\d+[\.\d]*(?:[.,]\d+)?)\s*euro",
            r"importo\s+massimo.*?(\d+[\.\d]*(?:[.,]\d+)?)\s*euro",
            r"limite.*?(\d+[\.\d]*(?:[.,]\d+)?)\s*euro",
            r"spesa\s+massima.*?(\d+[\.\d]*(?:[.,]\d+)?)\s*euro",
        ]

        amounts = []
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                raw = match.group(1)
                # Normalize: remove dots used as thousands separators, convert comma to dot
                # e.g. "96.000" -> "96000", "10.000,50" -> "10000.50"
                if "," in raw:
                    # Has comma: dots are thousands separators, comma is decimal
                    raw = raw.replace(".", "").replace(",", ".")
                else:
                    # No comma: dots could be thousands separators if followed by 3 digits
                    # e.g. "96.000" -> 96000, but "96.5" -> 96.5
                    parts = raw.split(".")
                    if len(parts) > 1 and all(len(p) == 3 for p in parts[1:]):
                        raw = raw.replace(".", "")
                    # Otherwise keep as-is (already a decimal number)

                try:
                    value = float(raw)
                    if 100 <= value <= 500000:
                        amounts.append(value)
                except ValueError:
                    continue

        return max(amounts) if amounts else None

    def extract(self, raw_data: dict) -> list[dict]:
        """Extract rules from downloaded HTML guide pages via direct text parsing.

        For each guide page, extracts text and builds a rule dict with fields
        parsed directly from the content.

        Args:
            raw_data: Dict with 'guides' key containing fetched guide info.

        Returns:
            List of rule dicts in standard format.
        """
        guides = raw_data.get("guides", [])
        if not guides:
            logger.warning("Nessuna guida da analizzare")
            return []

        all_rules = []

        for guide in guides:
            slug = guide.get("slug", "")
            name = guide.get("name", "")
            text = guide.get("text", "")

            if not text or len(text.strip()) < 100:
                logger.warning(f"Testo insufficiente per guida: {name}")
                continue

            try:
                rule = {
                    "slug": slug,
                    "name": name,
                    "shortDescription": text[:300].strip(),
                    "fullDescription": text[:3000].strip(),
                    "category": "detrazioni",
                    "target": "persona",
                    "certaintyLevel": "certo",
                    "sourceName": "Agenzia delle Entrate",
                    "requiredDocs": [],
                    "requirements": [],
                }

                # Detect percentage
                rule["percentage"] = self._detect_percentage(rule)

                # Extract max amount
                rule["maxAmount"] = self._extract_max_amount(text)

                # Extract howToClaim
                how_to_claim = None
                how_patterns = [
                    r"come\s+richiedere",
                    r"come\s+fare",
                    r"modalit[aà]",
                ]
                text_lower = text.lower()
                for pattern in how_patterns:
                    match = re.search(pattern, text_lower)
                    if match:
                        start = match.start()
                        how_to_claim = text[start:start + 500].strip()
                        break
                rule["howToClaim"] = how_to_claim

                # Build tags
                tags = ["guida-fiscale"]
                title_lower = name.lower()
                for kw in TAG_KEYWORDS:
                    kw_match = kw.replace("-", " ")
                    if kw_match in title_lower:
                        if kw not in tags:
                            tags.append(kw)
                rule["tags"] = tags

                # Add a basic requirement if percentage was detected
                if rule["percentage"] is not None:
                    rule["requirements"].append({
                        "field": "spesaSostenuta",
                        "operator": "gt",
                        "value": "0",
                        "isRequired": True,
                    })

                all_rules.append(rule)
                logger.info(f"Estratta regola da '{name}' (slug: {slug})")

            except Exception as e:
                logger.error(f"Errore nell'estrazione da '{name}': {e}")
                continue

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
                f"agenzia_entrate_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole estratte da Agenzia Entrate: {len(unique_rules)}")
        return unique_rules

    def _detect_percentage(self, rule: dict) -> float | None:
        """Try to detect a percentage from the rule description."""
        text = (
            f"{rule.get('name', '')} "
            f"{rule.get('shortDescription', '')} "
            f"{rule.get('fullDescription', '')}"
        )

        percentage_patterns = [
            r"(\d{2,3})\s*%",
            r"detrazione\s+del\s+(\d{2,3})",
            r"aliquota\s+del\s+(\d{2,3})",
        ]

        for pattern in percentage_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    pct = float(match.group(1))
                    if 1 <= pct <= 110:
                        return pct
                except ValueError:
                    continue

        return None

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries."""
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
