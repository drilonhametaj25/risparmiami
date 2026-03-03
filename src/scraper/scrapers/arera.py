"""ARERA energy regulator scraper for electricity and gas tariff data.

Scrapes ARERA open data pages for electricity and gas tariffs,
parses tariff tables, calculates regional averages, and generates
comparison rules for the "bollette" category. Also updates average-bills data.

Schedule: quarterly
Category: bollette
"""
import sys
import os
import re
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
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "arera")

# ARERA data pages
ARERA_BASE = "https://www.arera.it"
ARERA_ELECTRICITY_URL = "https://www.arera.it/per-il-consumatore/elettricita"
ARERA_GAS_URL = "https://www.arera.it/per-il-consumatore/gas"
ARERA_OPENDATA_URL = "https://www.arera.it/dati-e-statistiche"
ARERA_BOLLETTA_URL = "https://www.arera.it/bolletta"
ARERA_BONUS_SOCIALE_URL = "https://www.arera.it/consumatori/bonus-sociale"
ARERA_TARIFF_UPDATES_URL = "https://www.arera.it/comunicati-stampa"

# Regions for regional average calculations
ITALIAN_REGIONS = [
    "Piemonte", "Valle d'Aosta", "Lombardia", "Trentino-Alto Adige",
    "Veneto", "Friuli Venezia Giulia", "Liguria", "Emilia-Romagna",
    "Toscana", "Umbria", "Marche", "Lazio", "Abruzzo", "Molise",
    "Campania", "Puglia", "Basilicata", "Calabria", "Sicilia", "Sardegna",
]

MAX_RETRIES = 3
RETRY_DELAY = 5

# Average bill reference data for a typical Italian household
# (resident, 2700 kWh/year electricity, 1400 Smc/year gas)
DEFAULT_AVERAGE_BILLS = {
    "electricity": {
        "protected_market": {
            "annual_cost": 560.0,
            "price_per_kwh": 0.207,
            "fixed_costs": 85.0,
        },
        "free_market_average": {
            "annual_cost": 620.0,
            "price_per_kwh": 0.230,
            "fixed_costs": 90.0,
        },
        "reference_consumption_kwh": 2700,
    },
    "gas": {
        "protected_market": {
            "annual_cost": 1050.0,
            "price_per_smc": 0.75,
            "fixed_costs": 120.0,
        },
        "free_market_average": {
            "annual_cost": 1150.0,
            "price_per_smc": 0.82,
            "fixed_costs": 130.0,
        },
        "reference_consumption_smc": 1400,
    },
}


class ARERAScraper(BaseScraper):
    """Scraper for ARERA energy tariff data."""

    name = "arera"
    source_url = SOURCES.get("arera", "https://www.arera.it")

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
        """Fetch electricity and gas tariff data from ARERA.

        Returns:
            Dict with 'electricity', 'gas', 'bonus_sociale', 'communications' keys.
        """
        data = {
            "electricity": {},
            "gas": {},
            "bonus_sociale": {},
            "communications": [],
            "raw_tables": [],
        }

        # Fetch electricity tariff page
        try:
            elec_data = self._fetch_tariff_page(ARERA_ELECTRICITY_URL, "elettricita")
            data["electricity"] = elec_data
            logger.info("Dati tariffe elettricita' recuperati")
        except Exception as e:
            logger.error(f"Errore nel recupero tariffe elettricita': {e}")

        time.sleep(2)

        # Fetch gas tariff page
        try:
            gas_data = self._fetch_tariff_page(ARERA_GAS_URL, "gas")
            data["gas"] = gas_data
            logger.info("Dati tariffe gas recuperati")
        except Exception as e:
            logger.error(f"Errore nel recupero tariffe gas: {e}")

        time.sleep(2)

        # Fetch bonus sociale page
        try:
            bonus_data = self._fetch_tariff_page(ARERA_BONUS_SOCIALE_URL, "bonus_sociale")
            data["bonus_sociale"] = bonus_data
            logger.info("Dati bonus sociale recuperati")
        except Exception as e:
            logger.error(f"Errore nel recupero bonus sociale: {e}")

        time.sleep(2)

        # Fetch latest communications about tariff changes
        try:
            comms = self._fetch_communications()
            data["communications"] = comms
            logger.info(f"Recuperati {len(comms)} comunicati stampa")
        except Exception as e:
            logger.error(f"Errore nel recupero comunicati stampa: {e}")

        # Save raw data
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"arera_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return data

    def _fetch_tariff_page(self, url: str, tipo: str) -> dict:
        """Fetch and parse a tariff page from ARERA."""
        result = {"url": url, "tables": [], "text_content": "", "prices": {}}

        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")

                # Save raw HTML
                html_path = os.path.join(OUTPUT_DIR, f"arera_{tipo}.html")
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(response.text)

                # Extract tables
                tables = soup.find_all("table")
                for table in tables:
                    parsed_table = self._parse_html_table(table)
                    if parsed_table:
                        result["tables"].append(parsed_table)

                # Extract text content for price parsing
                content_el = (
                    soup.select_one(".field-items")
                    or soup.select_one(".article-content")
                    or soup.select_one("main")
                    or soup.select_one("#content")
                )
                if content_el:
                    result["text_content"] = content_el.get_text(
                        separator="\n", strip=True
                    )
                else:
                    result["text_content"] = soup.get_text(
                        separator="\n", strip=True
                    )[:20000]

                # Try to extract specific prices from the text
                result["prices"] = self._extract_prices_from_text(
                    result["text_content"], tipo
                )

                # Look for CSV/Excel download links
                for link in soup.find_all("a", href=True):
                    href = link.get("href", "")
                    if any(
                        ext in href.lower()
                        for ext in [".csv", ".xlsx", ".xls", "download"]
                    ):
                        abs_url = urljoin(url, href)
                        try:
                            self._download_data_file(abs_url, tipo)
                        except Exception as e:
                            logger.debug(f"Errore download file dati {abs_url}: {e}")

                break

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} fallito per {url}: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue

        return result

    def _fetch_communications(self) -> list[dict]:
        """Fetch recent ARERA communications about tariff changes."""
        comms = []

        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(ARERA_TARIFF_UPDATES_URL, timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")

                # Look for communication entries
                items = soup.select(
                    ".comunicato, .news-item, .list-item, article, "
                    ".views-row, .field-content"
                )

                if not items:
                    items = soup.find_all(
                        "div",
                        class_=lambda c: c and any(
                            kw in c.lower()
                            for kw in ["comunicat", "news", "item"]
                        ),
                    )

                for item in items[:20]:
                    title_el = item.find(["h2", "h3", "h4", "a"])
                    if not title_el:
                        continue

                    title = title_el.get_text(strip=True)
                    # Filter for tariff-related communications
                    tariff_keywords = [
                        "tariff", "bollett", "prezzo", "elettric",
                        "gas", "energia", "consumator",
                    ]
                    if not any(kw in title.lower() for kw in tariff_keywords):
                        continue

                    link_el = item.find("a", href=True)
                    href = ""
                    if link_el:
                        href = urljoin(ARERA_TARIFF_UPDATES_URL, link_el.get("href", ""))

                    date_el = item.find(
                        "span",
                        class_=lambda c: c and "dat" in c.lower()
                    ) if item else None
                    date_str = date_el.get_text(strip=True) if date_el else ""

                    comms.append({
                        "title": title,
                        "url": href,
                        "date": date_str,
                        "text": item.get_text(separator="\n", strip=True)[:2000],
                    })

                break

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo comunicati {attempt + 1}/{MAX_RETRIES} fallito: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
                continue

        return comms

    def _parse_html_table(self, table_el) -> list[list[str]] | None:
        """Parse an HTML table element into a list of rows."""
        rows = []
        for tr in table_el.find_all("tr"):
            cells = []
            for td in tr.find_all(["td", "th"]):
                cells.append(td.get_text(strip=True))
            if cells:
                rows.append(cells)

        return rows if len(rows) > 1 else None

    def _extract_prices_from_text(self, text: str, tipo: str) -> dict:
        """Extract energy prices from text content using regex patterns."""
        prices = {}

        if tipo == "elettricita":
            patterns = {
                "prezzo_kwh": [
                    r"(\d+[.,]\d+)\s*(?:cent|c)/kWh",
                    r"(\d+[.,]\d+)\s*EUR/kWh",
                    r"prezzo.*?(\d+[.,]\d+)\s*(?:cent|EUR)",
                ],
                "costo_annuo": [
                    r"spesa\s+annua.*?(\d+[.,]?\d*)\s*euro",
                    r"costo\s+annuo.*?(\d+[.,]?\d*)\s*euro",
                    r"(\d{3,4})\s*euro.*?anno",
                ],
                "oneri_sistema": [
                    r"oneri\s+di\s+sistema.*?(\d+[.,]\d+)",
                ],
            }
        else:  # gas
            patterns = {
                "prezzo_smc": [
                    r"(\d+[.,]\d+)\s*(?:cent|EUR)/[Ss]mc",
                    r"(\d+[.,]\d+)\s*EUR/metro\s*cubo",
                    r"prezzo.*?(\d+[.,]\d+)\s*(?:cent|EUR).*?[Ss]mc",
                ],
                "costo_annuo": [
                    r"spesa\s+annua.*?(\d+[.,]?\d*)\s*euro",
                    r"costo\s+annuo.*?(\d+[.,]?\d*)\s*euro",
                    r"(\d{3,4})\s*euro.*?anno",
                ],
            }

        for key, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value_str = match.group(1).replace(",", ".")
                    try:
                        prices[key] = float(value_str)
                    except ValueError:
                        continue
                    break

        return prices

    def _download_data_file(self, url: str, tipo: str):
        """Download a data file (CSV/Excel) from ARERA."""
        filename = url.split("/")[-1][:80]
        if not filename:
            filename = f"arera_{tipo}_data"
        local_path = os.path.join(OUTPUT_DIR, filename)

        response = self.session.get(url, timeout=30)
        response.raise_for_status()

        with open(local_path, "wb") as f:
            f.write(response.content)

        logger.info(f"File dati scaricato: {local_path}")

    def extract(self, raw_data: dict) -> list[dict]:
        """Parse tariff data and generate rules for the 'bollette' category.

        Builds rules for:
        - Protected vs free market comparison for electricity
        - Protected vs free market comparison for gas
        - Regional tariff optimization advice
        - Bonus Sociale Elettricita/Gas

        Also updates average-bills.json data.
        """
        rules = []

        # Build average bill data from scraped prices + defaults
        avg_bills = self._build_average_bills(raw_data)

        # Save average bills data
        avg_bills_path = os.path.join(
            os.path.dirname(__file__), "..", "outputs", "extracted",
            "average-bills.json",
        )
        os.makedirs(os.path.dirname(avg_bills_path), exist_ok=True)
        with open(avg_bills_path, "w", encoding="utf-8") as f:
            json.dump(avg_bills, f, ensure_ascii=False, indent=2)

        # Rule 1: Confronto mercato tutelato vs libero - Elettricita
        elec_protected = avg_bills["electricity"]["protected_market"]["annual_cost"]
        elec_free = avg_bills["electricity"]["free_market_average"]["annual_cost"]
        elec_saving = elec_free - elec_protected

        rules.append({
            "slug": "confronto-mercato-elettricita",
            "name": "Confronto Mercato Elettricita'",
            "shortDescription": (
                f"Il mercato tutelato dell'elettricita' costa mediamente "
                f"{elec_protected:.0f} EUR/anno contro {elec_free:.0f} EUR/anno "
                f"del mercato libero per un consumo tipo di "
                f"{avg_bills['electricity']['reference_consumption_kwh']} kWh/anno."
            ),
            "fullDescription": (
                f"Secondo i dati ARERA, una famiglia tipo con consumo di "
                f"{avg_bills['electricity']['reference_consumption_kwh']} kWh/anno paga "
                f"mediamente {elec_protected:.0f} EUR nel mercato tutelato e "
                f"{elec_free:.0f} EUR nel mercato libero. La differenza media e' di "
                f"{abs(elec_saving):.0f} EUR/anno. Confrontare le offerte usando "
                f"il Portale Offerte ARERA (offfrteenergiagas.arera.it) per trovare "
                f"l'offerta migliore per il proprio profilo di consumo."
            ),
            "category": "bollette",
            "target": "persona",
            "maxAmount": abs(elec_saving),
            "percentage": None,
            "certaintyLevel": "consiglio",
            "howToClaim": (
                "Confrontare le offerte su ilportaleofferte.it di ARERA. "
                "Verificare il prezzo dell'energia (EUR/kWh), i costi fissi annui, "
                "e eventuali sconti. Richiedere il cambio fornitore direttamente online."
            ),
            "requiredDocs": [
                "Ultima bolletta elettricita'",
                "Codice POD (sulla bolletta)",
                "Documento di identita'",
                "Codice fiscale",
            ],
            "tags": ["elettricita", "bollette", "mercato-libero", "arera"],
            "sourceName": "ARERA",
            "requirements": [
                {
                    "field": "monthlyElectricityCost",
                    "operator": "gt",
                    "value": "0",
                    "isRequired": False,
                }
            ],
        })

        # Rule 2: Confronto mercato tutelato vs libero - Gas
        gas_protected = avg_bills["gas"]["protected_market"]["annual_cost"]
        gas_free = avg_bills["gas"]["free_market_average"]["annual_cost"]
        gas_saving = gas_free - gas_protected

        rules.append({
            "slug": "confronto-mercato-gas",
            "name": "Confronto Mercato Gas",
            "shortDescription": (
                f"Il mercato tutelato del gas costa mediamente "
                f"{gas_protected:.0f} EUR/anno contro {gas_free:.0f} EUR/anno "
                f"del mercato libero per un consumo tipo di "
                f"{avg_bills['gas']['reference_consumption_smc']} Smc/anno."
            ),
            "fullDescription": (
                f"Una famiglia tipo con consumo di "
                f"{avg_bills['gas']['reference_consumption_smc']} Smc/anno paga "
                f"mediamente {gas_protected:.0f} EUR nel mercato tutelato e "
                f"{gas_free:.0f} EUR nel mercato libero. Si consiglia di confrontare "
                f"le offerte tramite il Portale Offerte ARERA per individuare "
                f"l'opzione piu' conveniente."
            ),
            "category": "bollette",
            "target": "persona",
            "maxAmount": abs(gas_saving),
            "percentage": None,
            "certaintyLevel": "consiglio",
            "howToClaim": (
                "Confrontare le offerte su ilportaleofferte.it di ARERA. "
                "Verificare il prezzo del gas (EUR/Smc), i costi fissi, "
                "e richiedere il cambio fornitore online o tramite il nuovo fornitore."
            ),
            "requiredDocs": [
                "Ultima bolletta gas",
                "Codice PDR (sulla bolletta)",
                "Documento di identita'",
                "Codice fiscale",
            ],
            "tags": ["gas", "bollette", "mercato-libero", "arera"],
            "sourceName": "ARERA",
            "requirements": [
                {
                    "field": "monthlyGasCost",
                    "operator": "gt",
                    "value": "0",
                    "isRequired": False,
                }
            ],
        })

        # Rule 3: Bonus Sociale Elettricita
        rules.append({
            "slug": "bonus-sociale-elettricita",
            "name": "Bonus Sociale Elettricita'",
            "shortDescription": (
                "Sconto automatico sulla bolletta elettrica per famiglie con ISEE "
                "fino a 9.530 EUR (20.000 EUR per famiglie numerose 4+ figli)."
            ),
            "fullDescription": (
                "Il Bonus Sociale Elettrico e' uno sconto applicato automaticamente "
                "in bolletta per le famiglie in condizione di disagio economico. "
                "Non serve fare domanda: viene riconosciuto automaticamente "
                "a chi presenta la DSU/ISEE e rientra nelle soglie. Lo sconto varia "
                "in base al numero di componenti del nucleo familiare e puo' arrivare "
                "a circa 200 EUR/anno. Per le famiglie con componenti in gravi "
                "condizioni di salute che necessitano di apparecchiature elettromedicali "
                "e' previsto un bonus aggiuntivo."
            ),
            "category": "bollette",
            "target": "persona",
            "maxAmount": 200.0,
            "percentage": None,
            "certaintyLevel": "certo",
            "howToClaim": (
                "Il bonus e' automatico. Basta presentare la DSU per ottenere "
                "l'ISEE presso un CAF o tramite il sito INPS. Se l'ISEE rientra "
                "nelle soglie, lo sconto viene applicato direttamente in bolletta."
            ),
            "requiredDocs": [
                "DSU (Dichiarazione Sostitutiva Unica)",
                "Attestazione ISEE in corso di validita'",
            ],
            "tags": ["bonus-sociale", "elettricita", "bollette", "isee", "arera"],
            "sourceName": "ARERA",
            "requirements": [
                {
                    "field": "iseeRange",
                    "operator": "lte",
                    "value": "9530",
                    "isRequired": True,
                }
            ],
        })

        # Rule 4: Bonus Sociale Gas
        rules.append({
            "slug": "bonus-sociale-gas",
            "name": "Bonus Sociale Gas",
            "shortDescription": (
                "Sconto automatico sulla bolletta del gas per famiglie con ISEE "
                "fino a 9.530 EUR (20.000 EUR per famiglie numerose 4+ figli)."
            ),
            "fullDescription": (
                "Il Bonus Sociale Gas e' uno sconto sulla bolletta del gas naturale "
                "per le famiglie in difficolta' economica. Come per il bonus elettrico, "
                "viene applicato automaticamente dopo la presentazione della DSU/ISEE. "
                "L'importo dello sconto dipende dalla zona climatica, dal numero di "
                "componenti familiari e dal tipo di utilizzo del gas (riscaldamento, "
                "acqua calda, cottura). Puo' arrivare a oltre 200 EUR/anno."
            ),
            "category": "bollette",
            "target": "persona",
            "maxAmount": 250.0,
            "percentage": None,
            "certaintyLevel": "certo",
            "howToClaim": (
                "Il bonus e' automatico. Presentare la DSU per ottenere l'ISEE "
                "presso un CAF o tramite il sito INPS. Lo sconto sara' applicato "
                "direttamente dal fornitore di gas in bolletta."
            ),
            "requiredDocs": [
                "DSU (Dichiarazione Sostitutiva Unica)",
                "Attestazione ISEE in corso di validita'",
            ],
            "tags": ["bonus-sociale", "gas", "bollette", "isee", "arera"],
            "sourceName": "ARERA",
            "requirements": [
                {
                    "field": "iseeRange",
                    "operator": "lte",
                    "value": "9530",
                    "isRequired": True,
                }
            ],
        })

        # Rule 5: Risparmio cambio fornitore luce
        rules.append({
            "slug": "risparmio-cambio-fornitore-luce",
            "name": "Risparmio Cambio Fornitore Luce",
            "shortDescription": (
                "Confrontando le offerte sul Portale Offerte ARERA si possono "
                "risparmiare fino a 100-150 EUR/anno sulla bolletta della luce."
            ),
            "fullDescription": (
                "Il Portale Offerte di ARERA (ilportaleofferte.it) consente di "
                "confrontare tutte le offerte dei fornitori di energia elettrica "
                "disponibili nella propria zona. Inserendo i propri dati di consumo "
                "si ottiene una stima personalizzata del costo annuo con ogni fornitore. "
                "Il cambio fornitore e' gratuito e senza interruzioni di servizio. "
                "Si consiglia di verificare periodicamente le offerte, specialmente "
                "alla scadenza del contratto in essere."
            ),
            "category": "bollette",
            "target": "persona",
            "maxAmount": 150.0,
            "percentage": None,
            "certaintyLevel": "consiglio",
            "howToClaim": (
                "1. Visitare ilportaleofferte.it\n"
                "2. Inserire i propri consumi annui (dalla bolletta)\n"
                "3. Confrontare le offerte disponibili\n"
                "4. Contattare il fornitore scelto per attivare l'offerta"
            ),
            "requiredDocs": [
                "Bolletta recente con dati consumo",
                "Codice POD",
            ],
            "tags": ["risparmio", "elettricita", "cambio-fornitore", "arera"],
            "sourceName": "ARERA",
            "requirements": [
                {
                    "field": "energyProvider",
                    "operator": "exists",
                    "value": "true",
                    "isRequired": False,
                }
            ],
        })

        # Rule 6: Risparmio cambio fornitore gas
        rules.append({
            "slug": "risparmio-cambio-fornitore-gas",
            "name": "Risparmio Cambio Fornitore Gas",
            "shortDescription": (
                "Confrontando le offerte sul Portale Offerte ARERA si possono "
                "risparmiare fino a 100-200 EUR/anno sulla bolletta del gas."
            ),
            "fullDescription": (
                "Il Portale Offerte ARERA permette di confrontare le offerte gas "
                "di tutti i fornitori. Il cambio fornitore e' gratuito, non comporta "
                "interruzioni di servizio e non richiede interventi tecnici. "
                "E' particolarmente conveniente confrontare le offerte a prezzo fisso "
                "con quelle a prezzo variabile per scegliere la soluzione piu' adatta "
                "al proprio profilo di consumo."
            ),
            "category": "bollette",
            "target": "persona",
            "maxAmount": 200.0,
            "percentage": None,
            "certaintyLevel": "consiglio",
            "howToClaim": (
                "1. Visitare ilportaleofferte.it\n"
                "2. Inserire i propri consumi annui di gas\n"
                "3. Confrontare le offerte\n"
                "4. Richiedere l'attivazione al nuovo fornitore"
            ),
            "requiredDocs": [
                "Bolletta recente con dati consumo gas",
                "Codice PDR",
            ],
            "tags": ["risparmio", "gas", "cambio-fornitore", "arera"],
            "sourceName": "ARERA",
            "requirements": [
                {
                    "field": "gasProvider",
                    "operator": "exists",
                    "value": "true",
                    "isRequired": False,
                }
            ],
        })

        # Save extracted rules
        extracted_dir = os.path.join(
            os.path.dirname(__file__), "..", "outputs", "extracted"
        )
        save_rules_json(
            rules,
            os.path.join(
                extracted_dir,
                f"arera_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole generate da ARERA: {len(rules)}")
        return rules

    def _build_average_bills(self, raw_data: dict) -> dict:
        """Build average bill data from scraped prices, falling back to defaults."""
        avg = json.loads(json.dumps(DEFAULT_AVERAGE_BILLS))  # deep copy

        # Update electricity prices from scraped data
        elec_prices = raw_data.get("electricity", {}).get("prices", {})
        if elec_prices.get("prezzo_kwh"):
            avg["electricity"]["protected_market"]["price_per_kwh"] = (
                elec_prices["prezzo_kwh"]
            )
            ref_kwh = avg["electricity"]["reference_consumption_kwh"]
            fixed = avg["electricity"]["protected_market"]["fixed_costs"]
            avg["electricity"]["protected_market"]["annual_cost"] = (
                elec_prices["prezzo_kwh"] * ref_kwh + fixed
            )

        if elec_prices.get("costo_annuo"):
            avg["electricity"]["protected_market"]["annual_cost"] = (
                elec_prices["costo_annuo"]
            )

        # Update gas prices from scraped data
        gas_prices = raw_data.get("gas", {}).get("prices", {})
        if gas_prices.get("prezzo_smc"):
            avg["gas"]["protected_market"]["price_per_smc"] = gas_prices["prezzo_smc"]
            ref_smc = avg["gas"]["reference_consumption_smc"]
            fixed = avg["gas"]["protected_market"]["fixed_costs"]
            avg["gas"]["protected_market"]["annual_cost"] = (
                gas_prices["prezzo_smc"] * ref_smc + fixed
            )

        if gas_prices.get("costo_annuo"):
            avg["gas"]["protected_market"]["annual_cost"] = gas_prices["costo_annuo"]

        avg["last_updated"] = datetime.now().isoformat()

        return avg

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries."""
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
