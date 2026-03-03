"""incentivi.gov.it scraper using the Solr API.

Queries the incentivi.gov.it Solr endpoint for active business incentives,
parses the JSON responses, and structures incentive data into
Rule format for the database.

Schedule: weekly
Category: incentivi
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
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "incentivi_gov")

SOLR_ENDPOINT = "https://www.incentivi.gov.it/solr/coredrupal/select"
INCENTIVI_BASE = "https://www.incentivi.gov.it"

SOLR_FIELDS = ",".join([
    "zs_title",
    "zs_url",
    "zs_body",
    "zs_field_budget_allocation",
    "zs_field_cost_min",
    "zs_field_cost_max",
    "zs_field_open_date",
    "zs_field_close_date",
    "zs_field_scopes_value",
    "zs_field_subject_type_value",
    "zs_field_support_form_value",
    "zs_field_dimensions_value",
    "zm_field_regions_value",
    "zs_field_subject_grant",
    "zs_field_primary_ruleset",
    "zs_field_link",
])

ROWS_PER_PAGE = 100
MAX_PAGES = 5
MAX_RETRIES = 3
RETRY_DELAY = 5

ALL_ITALIAN_REGIONS = {
    "abruzzo", "basilicata", "calabria", "campania", "emilia-romagna",
    "friuli venezia giulia", "lazio", "liguria", "lombardia", "marche",
    "molise", "piemonte", "puglia", "sardegna", "sicilia", "toscana",
    "trentino-alto adige", "umbria", "valle d'aosta", "veneto",
}


class IncentiviGovScraper(BaseScraper):
    """Scraper for incentivi.gov.it using the Solr API."""

    name = "incentivi_gov"
    source_url = SOURCES.get("incentivi_gov", "https://www.incentivi.gov.it")

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Language": "it-IT,it;q=0.9,en;q=0.5",
        })
        self._diff_checker = DiffChecker()
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    def fetch(self) -> dict:
        """Fetch incentives from the incentivi.gov.it Solr API.

        Makes paginated requests (100 per page, up to 5 pages / 500 items).
        Saves raw JSON to OUTPUT_DIR.

        Returns:
            Dict with 'incentives' key containing list of Solr doc dicts.
        """
        all_docs = []

        for page in range(MAX_PAGES):
            start = page * ROWS_PER_PAGE

            params = {
                "q": "*:*",
                "wt": "json",
                "fq": "index_id:incentivi",
                "rows": ROWS_PER_PAGE,
                "start": start,
                "fl": SOLR_FIELDS,
            }

            docs = self._solr_request(params)
            if docs is None:
                logger.error(f"Errore nel recupero pagina {page}, interruzione paginazione")
                break

            all_docs.extend(docs)
            logger.info(f"Pagina {page + 1}: recuperati {len(docs)} documenti (totale: {len(all_docs)})")

            # Stop if we got fewer results than requested (last page)
            if len(docs) < ROWS_PER_PAGE:
                break

            # Be polite between pages
            time.sleep(1)

        # Save raw data
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"incentivi_solr_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(all_docs, f, ensure_ascii=False, indent=2)

        logger.info(f"Totale incentivi recuperati dal Solr: {len(all_docs)}")
        return {"incentives": all_docs}

    def _solr_request(self, params: dict) -> list[dict] | None:
        """Execute a single Solr request with retries.

        Returns:
            List of doc dicts on success, or None on failure.
        """
        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(
                    SOLR_ENDPOINT,
                    params=params,
                    timeout=30,
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", {}).get("docs", [])

            except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
                logger.warning(
                    f"Tentativo Solr {attempt + 1}/{MAX_RETRIES} fallito: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))

        return None

    def extract(self, raw_data: dict) -> list[dict]:
        """Convert Solr documents into Rule format.

        Maps Solr fields to the database Rule schema for the 'incentivi' category.
        """
        incentives = raw_data.get("incentives", [])
        if not incentives:
            logger.warning("Nessun incentivo da elaborare")
            return []

        rules = []
        now = datetime.now()

        for doc in incentives:
            title = doc.get("zs_title", "")
            if not title:
                continue

            slug = "incentivi-" + self._make_slug(title)
            if len(slug) <= len("incentivi-"):
                continue
            slug = slug[:100]

            # --- Strip HTML from body ---
            body_html = doc.get("zs_body", "")
            if body_html:
                soup = BeautifulSoup(body_html, "html.parser")
                body_text = soup.get_text(separator=" ", strip=True)
            else:
                body_text = ""

            # --- Amounts ---
            max_amount = None
            cost_max = doc.get("zs_field_cost_max")
            if cost_max is not None:
                try:
                    max_amount = float(cost_max)
                except (ValueError, TypeError):
                    max_amount = None

            budget = doc.get("zs_field_budget_allocation")

            # --- Target ---
            subject_type = doc.get("zs_field_subject_type_value", "")
            if "Persona" in subject_type:
                target = "persona"
            elif "Impresa" in subject_type:
                target = "azienda"
            else:
                target = "azienda"

            # --- Dates ---
            open_date = doc.get("zs_field_open_date", "")
            close_date = doc.get("zs_field_close_date", "")

            # --- Certainty level ---
            certainty = "probabile"
            if not close_date:
                certainty = "certo"
            else:
                try:
                    close_dt = datetime.fromisoformat(close_date.replace("Z", "+00:00"))
                    if close_dt.replace(tzinfo=None) > now:
                        certainty = "certo"
                except (ValueError, TypeError):
                    certainty = "probabile"

            # --- Short description (max 500 chars) ---
            short_description = body_text[:500] if body_text else title

            # --- Full description (max 3000 chars) ---
            full_desc_parts = []
            if body_text:
                full_desc_parts.append(body_text[:2500])

            dimensions = doc.get("zs_field_dimensions_value", "")
            if dimensions:
                full_desc_parts.append(f"Dimensione impresa: {dimensions}")

            if budget is not None:
                try:
                    budget_val = float(budget)
                    full_desc_parts.append(f"Dotazione finanziaria: {budget_val:,.0f} EUR")
                except (ValueError, TypeError):
                    full_desc_parts.append(f"Dotazione finanziaria: {budget}")

            full_description = "\n".join(full_desc_parts)[:3000]

            # --- Tags ---
            tags = ["incentivi"]
            scope = doc.get("zs_field_scopes_value", "")
            support_form = doc.get("zs_field_support_form_value", "")
            if scope:
                tags.append(scope.lower().strip())
            if support_form:
                tags.append(support_form.lower().strip())

            # --- How to claim ---
            url = doc.get("zs_url", "")
            full_url = f"{INCENTIVI_BASE}{url}" if url else "https://www.incentivi.gov.it"
            ext_link = doc.get("zs_field_link", "")
            granting_entity = doc.get("zs_field_subject_grant", "")

            how_parts = [f"Consultare il bando completo su {full_url}."]
            if ext_link:
                how_parts.append(f"Link esterno: {ext_link}")
            if granting_entity:
                how_parts.append(f"Ente erogatore: {granting_entity}.")
            if open_date:
                how_parts.append(f"Data apertura: {open_date[:10]}.")
            if close_date:
                how_parts.append(f"Data chiusura: {close_date[:10]}.")
            how_parts.append("Presentare domanda secondo le modalita' indicate nel bando.")

            how_to_claim = " ".join(how_parts)

            # --- Requirements (region filtering) ---
            requirements = []
            regions = doc.get("zm_field_regions_value", [])
            if regions and isinstance(regions, list):
                region_names_lower = {r.lower().strip() for r in regions}
                # Only add region requirement if NOT all 20 Italian regions are listed
                if len(region_names_lower) < 20 and not region_names_lower >= ALL_ITALIAN_REGIONS:
                    requirements.append({
                        "field": "region",
                        "operator": "in",
                        "value": ", ".join(regions),
                        "isRequired": True,
                    })

            rule = {
                "slug": slug,
                "name": title[:200],
                "shortDescription": short_description,
                "fullDescription": full_description,
                "category": "incentivi",
                "target": target,
                "maxAmount": max_amount,
                "certaintyLevel": certainty,
                "howToClaim": how_to_claim,
                "requiredDocs": [
                    "Visura camerale",
                    "Bilancio ultimo esercizio",
                    "Documento di identita' del legale rappresentante",
                    "Business plan o progetto di investimento",
                ],
                "tags": tags,
                "sourceName": "incentivi.gov.it",
                "requirements": requirements,
            }

            rules.append(rule)

        # Deduplicate by slug
        seen_slugs = set()
        unique_rules = []
        for rule in rules:
            if rule["slug"] not in seen_slugs:
                seen_slugs.add(rule["slug"])
                unique_rules.append(rule)

        # Save extracted rules
        extracted_dir = os.path.join(
            os.path.dirname(__file__), "..", "outputs", "extracted"
        )
        save_rules_json(
            unique_rules,
            os.path.join(
                extracted_dir,
                f"incentivi_gov_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole generate da incentivi.gov.it: {len(unique_rules)}")
        return unique_rules

    def _make_slug(self, title: str) -> str:
        """Convert a title to a URL-safe slug."""
        slug = title.lower().strip()
        # Replace accented characters
        replacements = {
            "a'": "a", "e'": "e", "i'": "i", "o'": "o", "u'": "u",
            "\xe0": "a", "\xe8": "e", "\xe9": "e", "\xec": "i",
            "\xf2": "o", "\xf9": "u",
        }
        for old, new in replacements.items():
            slug = slug.replace(old, new)
        # Remove non-alphanumeric, replace spaces/multiple hyphens
        slug = re.sub(r"[^\w\s-]", "", slug)
        slug = re.sub(r"[\s_]+", "-", slug)
        slug = re.sub(r"-+", "-", slug)
        slug = slug.strip("-")
        return slug[:100] if slug else ""

    def _parse_amount(self, amount_text: str) -> float | None:
        """Parse an amount value from text."""
        if not amount_text:
            return None

        text = amount_text.lower().replace(".", "").replace(",", ".")

        # Try to find a numeric value
        # Handle "milioni" and "miliardi"
        match = re.search(r"(\d+(?:\.\d+)?)\s*milion", text)
        if match:
            return float(match.group(1)) * 1_000_000

        match = re.search(r"(\d+(?:\.\d+)?)\s*miliard", text)
        if match:
            return float(match.group(1)) * 1_000_000_000

        match = re.search(r"(\d+(?:\.\d+)?)\s*(?:euro|eur)", text)
        if match:
            value = float(match.group(1))
            if value > 0:
                return value

        # Plain number
        match = re.search(r"(\d+(?:\.\d+)?)", text)
        if match:
            value = float(match.group(1))
            if value > 100:  # Avoid small meaningless numbers
                return value

        return None

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries."""
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
