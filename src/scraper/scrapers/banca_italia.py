"""Banca d'Italia scraper for banking cost reports.

Downloads the annual "Indagine costi conti correnti" PDF and extracts
ICC (Indicatore Costo Complessivo) and average costs by account type/profile.

Schedule: yearly
Category: banca
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
from extractors.pdf_extractor import PdfExtractor
from extractors.rule_extractor import save_rules_json
from extractors.diff_checker import DiffChecker

logger = logging.getLogger(__name__)

USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs", "raw", "banca_italia")

# Banca d'Italia pages
BANKITALIA_BASE = "https://www.bancaditalia.it"
INDAGINE_COSTI_URL = "https://www.bancaditalia.it/pubblicazioni/indagine-costo-cc/index.html"
INDAGINE_ALT_URLS = [
    "https://www.bancaditalia.it/pubblicazioni/indagine-costo-cc/indagine-costo-cc2025/Indagine-costo-cc-2025.pdf",
]

# Known ICC values by profile type (fallback data updated periodically)
# Source: Banca d'Italia annual survey
DEFAULT_ICC_DATA = {
    "media_generale": {
        "icc_euro": 94.7,
        "description": "Costo medio complessivo di un conto corrente in Italia",
    },
    "giovani": {
        "icc_euro": 47.5,
        "description": "Conto corrente per giovani (under 30, operativita' limitata)",
        "profile": "Giovani sotto i 30 anni con bassa operativita'",
    },
    "famiglie_bassa_operativita": {
        "icc_euro": 68.0,
        "description": "Conto per famiglie con bassa operativita' (pochi movimenti/mese)",
        "profile": "Famiglie con meno di 100 operazioni/anno",
    },
    "famiglie_media_operativita": {
        "icc_euro": 95.0,
        "description": "Conto per famiglie con media operativita'",
        "profile": "Famiglie con 100-200 operazioni/anno",
    },
    "famiglie_alta_operativita": {
        "icc_euro": 127.0,
        "description": "Conto per famiglie con alta operativita'",
        "profile": "Famiglie con oltre 200 operazioni/anno",
    },
    "pensionati": {
        "icc_euro": 72.0,
        "description": "Conto per pensionati con operativita' limitata",
        "profile": "Pensionati con bassa operativita'",
    },
    "conto_online": {
        "icc_euro": 28.5,
        "description": "Conto corrente online (senza sportello fisico)",
        "profile": "Clienti che operano prevalentemente online",
    },
}

MAX_RETRIES = 3
RETRY_DELAY = 5


class BancaItaliaScraper(BaseScraper):
    """Scraper for Banca d'Italia banking cost reports."""

    name = "banca_italia"
    source_url = SOURCES.get("banca_italia", "https://www.bancaditalia.it")

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
        """Fetch the annual banking cost survey PDF from Banca d'Italia.

        Returns:
            Dict with 'pdf_path', 'tables', 'text_content', 'icc_data' keys.
        """
        data = {
            "pdf_path": None,
            "pdf_url": None,
            "tables": [],
            "text_content": "",
            "page_data": {},
        }

        # Try to find and download the ICC survey PDF
        urls_to_try = [INDAGINE_COSTI_URL] + INDAGINE_ALT_URLS

        for page_url in urls_to_try:
            try:
                result = self._scrape_survey_page(page_url)
                if result.get("pdf_path"):
                    data.update(result)
                    logger.info(f"PDF indagine scaricato da {page_url}")
                    break
                elif result.get("page_data"):
                    data["page_data"] = result["page_data"]
            except Exception as e:
                logger.warning(f"Errore nello scraping di {page_url}: {e}")
                continue

        # If we got a PDF, extract tables and text
        if data["pdf_path"] and os.path.exists(data["pdf_path"]):
            try:
                data["text_content"] = PdfExtractor.extract_text(data["pdf_path"])
                data["tables"] = PdfExtractor.extract_tables(data["pdf_path"])
                logger.info(
                    f"Estratti testo ({len(data['text_content'])} caratteri) "
                    f"e {len(data['tables'])} tabelle dal PDF"
                )
            except Exception as e:
                logger.error(f"Errore nell'estrazione dal PDF: {e}")

        # Save raw data metadata
        raw_path = os.path.join(
            OUTPUT_DIR,
            f"banca_italia_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        metadata = {
            "pdf_url": data.get("pdf_url"),
            "pdf_path": data.get("pdf_path"),
            "num_tables": len(data["tables"]),
            "text_length": len(data["text_content"]),
            "page_data": data.get("page_data", {}),
            "fetched_at": datetime.now().isoformat(),
        }
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        return data

    def _scrape_survey_page(self, url: str) -> dict:
        """Scrape a Banca d'Italia page for the ICC survey PDF link."""
        result = {"pdf_path": None, "pdf_url": None, "page_data": {}}

        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.text, "html.parser")

                # Save raw HTML
                html_path = os.path.join(OUTPUT_DIR, "banca_italia_page.html")
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(response.text)

                # Extract useful text from the page
                text = soup.get_text(separator="\n", strip=True)
                result["page_data"]["text"] = text[:10000]

                # Look for PDF links
                pdf_links = []
                for link in soup.find_all("a", href=True):
                    href = link.get("href", "")
                    title = link.get_text(strip=True)

                    if href.lower().endswith(".pdf"):
                        abs_url = urljoin(url, href)
                        pdf_links.append({
                            "url": abs_url,
                            "title": title,
                        })

                # Prioritize links with "indagine" or "costi" or "conti correnti"
                target_pdf = None
                for pl in pdf_links:
                    combined = f"{pl['title'].lower()} {pl['url'].lower()}"
                    if any(kw in combined for kw in [
                        "indagine", "costi", "conti correnti", "icc",
                        "indagine-costo", "costo-cc",
                    ]):
                        target_pdf = pl
                        break

                # Fall back to first PDF if no specific match
                if not target_pdf and pdf_links:
                    target_pdf = pdf_links[0]

                if target_pdf:
                    # Download the PDF
                    safe_name = re.sub(r"[^\w]", "_", target_pdf["title"])[:60]
                    pdf_path = os.path.join(
                        OUTPUT_DIR, f"{safe_name}_{datetime.now().year}.pdf"
                    )
                    try:
                        result["pdf_path"] = PdfExtractor.download_pdf(
                            target_pdf["url"], pdf_path
                        )
                        result["pdf_url"] = target_pdf["url"]
                    except Exception as e:
                        logger.error(f"Errore download PDF {target_pdf['url']}: {e}")

                # Also try to extract ICC values directly from the page text
                icc_matches = re.findall(
                    r"ICC.*?(\d+[.,]\d+)\s*euro",
                    text,
                    re.IGNORECASE,
                )
                if icc_matches:
                    result["page_data"]["icc_values"] = [
                        float(v.replace(",", ".")) for v in icc_matches
                    ]

                break

            except requests.exceptions.RequestException as e:
                logger.warning(
                    f"Tentativo {attempt + 1}/{MAX_RETRIES} fallito per {url}: {e}"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue

        return result

    def extract(self, raw_data: dict) -> list[dict]:
        """Extract banking cost rules from survey data.

        Parses tables for ICC values and creates rules for banking cost
        optimization by profile type.
        """
        rules = []

        # Try to extract ICC data from tables
        icc_data = self._extract_icc_from_tables(raw_data.get("tables", []))

        # Try to extract ICC from text
        if not icc_data:
            icc_data = self._extract_icc_from_text(raw_data.get("text_content", ""))

        # Use page-extracted values if available
        if not icc_data:
            page_icc = raw_data.get("page_data", {}).get("icc_values", [])
            if page_icc:
                icc_data = {"media_generale": {"icc_euro": page_icc[0]}}

        # Fall back to default data
        if not icc_data:
            logger.warning("Uso dati ICC predefiniti (nessun dato estratto)")
            icc_data = DEFAULT_ICC_DATA

        # Rule 1: Costo medio conto corrente in Italia
        media = icc_data.get("media_generale", DEFAULT_ICC_DATA["media_generale"])
        icc_medio = media.get("icc_euro", DEFAULT_ICC_DATA["media_generale"]["icc_euro"])

        rules.append({
            "slug": "costo-medio-conto-corrente",
            "name": "Costo Medio Conto Corrente in Italia",
            "shortDescription": (
                f"Il costo medio annuo di un conto corrente in Italia e' "
                f"circa {icc_medio:.0f} EUR (indicatore ICC, Banca d'Italia). "
                f"Un conto online costa mediamente {DEFAULT_ICC_DATA['conto_online']['icc_euro']:.0f} EUR."
            ),
            "fullDescription": (
                f"Secondo l'Indagine sui costi dei conti correnti della Banca d'Italia, "
                f"l'Indicatore di Costo Complessivo (ICC) medio e' pari a {icc_medio:.1f} EUR/anno. "
                f"Il costo varia significativamente per profilo: un conto online costa mediamente "
                f"{DEFAULT_ICC_DATA['conto_online']['icc_euro']:.0f} EUR, un conto per giovani "
                f"{DEFAULT_ICC_DATA['giovani']['icc_euro']:.0f} EUR, mentre un conto ad alta "
                f"operativita' puo' costare fino a "
                f"{DEFAULT_ICC_DATA['famiglie_alta_operativita']['icc_euro']:.0f} EUR. "
                f"Confrontare i costi con il proprio estratto conto per valutare se si paga troppo."
            ),
            "category": "banca",
            "target": "persona",
            "maxAmount": icc_medio,
            "percentage": None,
            "certaintyLevel": "consiglio",
            "howToClaim": (
                "Verificare il costo annuo del proprio conto corrente nell'estratto conto "
                "o nel Documento di Sintesi. Confrontare con l'ICC medio di Banca d'Italia. "
                "Se il costo e' superiore, valutare il cambio verso un conto online o un "
                "conto piu' adatto al proprio profilo."
            ),
            "requiredDocs": [
                "Estratto conto annuale",
                "Documento di Sintesi del conto corrente",
            ],
            "tags": ["conto-corrente", "banca", "icc", "costi-bancari"],
            "sourceName": "Banca d'Italia",
            "requirements": [
                {
                    "field": "monthlyBankCost",
                    "operator": "gt",
                    "value": "0",
                    "isRequired": False,
                }
            ],
        })

        # Rule 2: Risparmio con conto online
        risparmio_online = icc_medio - DEFAULT_ICC_DATA["conto_online"]["icc_euro"]

        rules.append({
            "slug": "risparmio-conto-online",
            "name": "Risparmio con Conto Online",
            "shortDescription": (
                f"Passando a un conto online si possono risparmiare fino a "
                f"{risparmio_online:.0f} EUR/anno rispetto al costo medio di un "
                f"conto tradizionale."
            ),
            "fullDescription": (
                f"I conti correnti online hanno un ICC medio di "
                f"{DEFAULT_ICC_DATA['conto_online']['icc_euro']:.0f} EUR/anno, "
                f"contro i {icc_medio:.0f} EUR del conto tradizionale medio. "
                f"Molti conti online offrono canone zero, operazioni illimitate, "
                f"carta di debito inclusa e nessun costo di gestione. "
                f"Il risparmio potenziale e' di circa {risparmio_online:.0f} EUR/anno. "
                f"Le banche online sono soggette alle stesse regole e garanzie "
                f"(Fondo Interbancario di Tutela dei Depositi) delle banche tradizionali."
            ),
            "category": "banca",
            "target": "persona",
            "maxAmount": risparmio_online,
            "percentage": None,
            "certaintyLevel": "consiglio",
            "howToClaim": (
                "1. Confrontare le offerte di conti online su comparatori (es. SOStariffe)\n"
                "2. Verificare: canone, costo operazioni, carte incluse, limiti\n"
                "3. Aprire il conto online dal sito della banca scelta\n"
                "4. Trasferire domiciliazioni e accredito stipendio\n"
                "5. Chiudere il vecchio conto (portabilita' gratuita)"
            ),
            "requiredDocs": [
                "Documento di identita'",
                "Codice fiscale",
                "Indirizzo email",
                "Smartphone per identificazione",
            ],
            "tags": ["conto-online", "risparmio", "banca", "digitale"],
            "sourceName": "Banca d'Italia",
            "requirements": [
                {
                    "field": "monthlyBankCost",
                    "operator": "gte",
                    "value": "8",
                    "isRequired": False,
                }
            ],
        })

        # Rule 3: Conto corrente per giovani
        rules.append({
            "slug": "conto-corrente-giovani",
            "name": "Conto Corrente Agevolato per Giovani",
            "shortDescription": (
                "I giovani sotto i 30 anni possono accedere a conti correnti a "
                "costo ridotto o gratuito, con un ICC medio di "
                f"{DEFAULT_ICC_DATA['giovani']['icc_euro']:.0f} EUR/anno."
            ),
            "fullDescription": (
                "Molte banche offrono condizioni agevolate per i giovani sotto i 30 anni "
                "(in alcuni casi fino a 35 anni). Questi conti prevedono canone zero o "
                f"molto ridotto, con un ICC medio di {DEFAULT_ICC_DATA['giovani']['icc_euro']:.0f} EUR. "
                "Spesso includono carta di debito gratuita, operazioni online illimitate "
                "e nessuna spesa di tenuta conto. Alcune banche offrono anche condizioni "
                "speciali per studenti universitari."
            ),
            "category": "banca",
            "target": "persona",
            "maxAmount": None,
            "percentage": None,
            "certaintyLevel": "certo",
            "howToClaim": (
                "Cercare offerte dedicate ai giovani presso banche tradizionali e online. "
                "Richiedere il conto presentando documento di identita' e codice fiscale. "
                "Verificare l'eta' massima prevista e le condizioni dopo il compimento "
                "del limite di eta'."
            ),
            "requiredDocs": [
                "Documento di identita'",
                "Codice fiscale",
            ],
            "tags": ["giovani", "conto-corrente", "banca", "under-30"],
            "sourceName": "Banca d'Italia",
            "requirements": [
                {
                    "field": "birthYear",
                    "operator": "gte",
                    "value": str(datetime.now().year - 30),
                    "isRequired": True,
                }
            ],
        })

        # Rule 4: Conto base per pensionati
        rules.append({
            "slug": "conto-base-pensionati",
            "name": "Conto di Base per Pensionati",
            "shortDescription": (
                "I pensionati con reddito ISEE inferiore a una determinata soglia "
                "hanno diritto a un conto di base a canone zero o molto ridotto."
            ),
            "fullDescription": (
                "Il conto di base e' un conto corrente con un numero limitato di "
                "operazioni a un costo contenuto, previsto per legge (D.Lgs 11/2010). "
                "Per i pensionati con trattamento annuo lordo fino a 18.000 EUR, "
                "il canone annuo e' zero. Per i titolari di trattamenti pensionistici "
                "fino a 18.000 EUR, include: accredito pensione, prelievi ATM, "
                "domiciliazione utenze, bonifici e pagamenti PagoPA. "
                f"Il costo medio di un conto per pensionati e' di "
                f"{DEFAULT_ICC_DATA['pensionati']['icc_euro']:.0f} EUR/anno."
            ),
            "category": "banca",
            "target": "persona",
            "maxAmount": DEFAULT_ICC_DATA["pensionati"]["icc_euro"],
            "percentage": None,
            "certaintyLevel": "certo",
            "howToClaim": (
                "Richiedere il conto di base presso qualsiasi banca o Poste Italiane. "
                "Presentare documentazione del trattamento pensionistico. "
                "La banca e' obbligata per legge a offrire questo tipo di conto."
            ),
            "requiredDocs": [
                "Documento di identita'",
                "Codice fiscale",
                "Cedolino pensione o CU (Certificazione Unica)",
            ],
            "tags": ["pensionati", "conto-base", "banca", "risparmio"],
            "sourceName": "Banca d'Italia",
            "requirements": [
                {
                    "field": "employmentType",
                    "operator": "eq",
                    "value": "pensionato",
                    "isRequired": True,
                },
                {
                    "field": "annualIncome",
                    "operator": "lte",
                    "value": "18000",
                    "isRequired": False,
                },
            ],
        })

        # Rule 5: Portabilita conto corrente
        rules.append({
            "slug": "portabilita-conto-corrente",
            "name": "Portabilita' Gratuita del Conto Corrente",
            "shortDescription": (
                "Il trasferimento del conto corrente da una banca all'altra "
                "e' gratuito per legge e deve essere completato entro 12 giorni."
            ),
            "fullDescription": (
                "La portabilita' del conto corrente (Legge 40/2007 e successive modifiche) "
                "garantisce il diritto di trasferire il proprio conto senza costi. "
                "La nuova banca si occupa di tutto: trasferimento dei servizi di pagamento, "
                "delle domiciliazioni, dell'accredito stipendio/pensione e della chiusura "
                "del vecchio conto. Il processo deve completarsi entro 12 giorni lavorativi. "
                "In caso di ritardo, il cliente ha diritto a un indennizzo."
            ),
            "category": "banca",
            "target": "persona",
            "maxAmount": None,
            "percentage": None,
            "certaintyLevel": "certo",
            "howToClaim": (
                "1. Scegliere la nuova banca\n"
                "2. Richiedere l'apertura del nuovo conto e la portabilita'\n"
                "3. La nuova banca si occupa del trasferimento\n"
                "4. Verificare che tutte le domiciliazioni siano state trasferite\n"
                "5. Nessun costo ne' per la chiusura ne' per il trasferimento"
            ),
            "requiredDocs": [
                "Documento di identita'",
                "Codice fiscale",
                "IBAN del vecchio conto",
                "Lista delle domiciliazioni attive",
            ],
            "tags": ["portabilita", "conto-corrente", "banca", "diritti"],
            "sourceName": "Banca d'Italia",
            "requirements": [
                {
                    "field": "bankName",
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
                f"banca_italia_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            ),
        )

        logger.info(f"Totale regole generate da Banca d'Italia: {len(rules)}")
        return rules

    def _extract_icc_from_tables(self, tables: list) -> dict:
        """Extract ICC values from parsed PDF tables."""
        icc_data = {}

        for table in tables:
            for row in table:
                row_text = " ".join(str(cell) for cell in row).lower()

                # Look for rows containing ICC or cost indicators
                if "icc" in row_text or "costo" in row_text or "indicatore" in row_text:
                    # Find numeric values in the row
                    for cell in row:
                        cell_str = str(cell).replace(",", ".").strip()
                        match = re.search(r"(\d+[.]\d+|\d+)", cell_str)
                        if match:
                            value = float(match.group(1))
                            # Sanity check: ICC should be between 10 and 500
                            if 10 <= value <= 500:
                                # Determine which profile this belongs to
                                if "giovan" in row_text:
                                    icc_data["giovani"] = {"icc_euro": value}
                                elif "pension" in row_text:
                                    icc_data["pensionati"] = {"icc_euro": value}
                                elif "online" in row_text or "digital" in row_text:
                                    icc_data["conto_online"] = {"icc_euro": value}
                                elif (
                                    "media" in row_text
                                    or "general" in row_text
                                    or "totale" in row_text
                                ):
                                    icc_data["media_generale"] = {"icc_euro": value}
                                elif "alta" in row_text:
                                    icc_data["famiglie_alta_operativita"] = {
                                        "icc_euro": value
                                    }
                                elif "bassa" in row_text:
                                    icc_data["famiglie_bassa_operativita"] = {
                                        "icc_euro": value
                                    }

        return icc_data

    def _extract_icc_from_text(self, text: str) -> dict:
        """Extract ICC values from PDF text using regex."""
        icc_data = {}

        if not text:
            return icc_data

        # Common patterns for ICC values in Banca d'Italia reports
        patterns = [
            (
                "media_generale",
                [
                    r"ICC\s+medio.*?(\d+[.,]\d+)\s*euro",
                    r"costo\s+medio.*?(\d+[.,]\d+)\s*euro",
                    r"indicatore.*?complessivo.*?(\d+[.,]\d+)\s*euro",
                    r"ICC.*?pari\s+a\s+(\d+[.,]\d+)",
                ],
            ),
            (
                "conto_online",
                [
                    r"online.*?(\d+[.,]\d+)\s*euro",
                    r"conti?\s+(?:correnti?\s+)?online.*?ICC.*?(\d+[.,]\d+)",
                ],
            ),
            (
                "giovani",
                [
                    r"giovan[ie].*?(\d+[.,]\d+)\s*euro",
                    r"under\s*30.*?(\d+[.,]\d+)\s*euro",
                ],
            ),
            (
                "pensionati",
                [
                    r"pension.*?(\d+[.,]\d+)\s*euro",
                ],
            ),
        ]

        for profile, profile_patterns in patterns:
            for pattern in profile_patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    value_str = match.group(1).replace(",", ".")
                    try:
                        value = float(value_str)
                        if 10 <= value <= 500:
                            icc_data[profile] = {"icc_euro": value}
                            break
                    except ValueError:
                        continue

        return icc_data

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare extracted rules against existing database entries."""
        result = self._diff_checker.check(rules, self.name)
        return result.new, result.updated
