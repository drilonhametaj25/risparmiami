import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://risparmiami:risparmiami@localhost:5435/risparmiami")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
SCRAPER_LOG_LEVEL = os.getenv("SCRAPER_LOG_LEVEL", "INFO")

# Meilisearch
MEILISEARCH_URL = os.getenv("MEILISEARCH_URL", "http://localhost:7700")
MEILISEARCH_KEY = os.getenv("MEILISEARCH_KEY", "")

# User Agent for HTTP requests
USER_AGENT = "RisparmiaMi-Scraper/1.0 (+https://risparmiami.pro)"

# Output directories
SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRAPER_DIR, "outputs")
OUTPUT_RAW_DIR = os.path.join(OUTPUT_DIR, "raw")
OUTPUT_EXTRACTED_DIR = os.path.join(OUTPUT_DIR, "extracted")
OUTPUT_RULES_DIR = os.path.join(OUTPUT_DIR, "rules")

# Source URLs
SOURCES = {
    "normattiva": "https://www.normattiva.it",
    "agenzia_entrate": "https://www.agenziaentrate.gov.it",
    "arera": "https://www.arera.it",
    "banca_italia": "https://www.bancaditalia.it",
    "inps": "https://www.inps.it",
    "incentivi_gov": "https://www.incentivi.gov.it",
    "trasporti": "https://www.trenitalia.com",
    "normattiva_codici": "https://www.normattiva.it",
    "normattiva_recenti": "https://www.normattiva.it",
    "gazzetta_ufficiale": "https://www.gazzettaufficiale.it",
}

# Schedule (cron expressions)
SCHEDULES = {
    "normattiva": {"trigger": "cron", "day_of_week": "mon", "hour": 3},
    "agenzia_entrate": {"trigger": "cron", "day": 1, "hour": 4},
    "arera": {"trigger": "cron", "day": 1, "month": "1,4,7,10", "hour": 5},
    "banca_italia": {"trigger": "cron", "month": 1, "day": 15, "hour": 6},
    "inps": {"trigger": "cron", "day": 1, "hour": 7},
    "incentivi_gov": {"trigger": "cron", "day_of_week": "wed", "hour": 3},
    "trasporti": {"trigger": "cron", "month": 1, "day": 1, "hour": 8},
    "normattiva_codici": {"trigger": "cron", "month": "1,7", "day": 1, "hour": 2},
    "normattiva_recenti": {"trigger": "cron", "day_of_week": "thu", "hour": 3},
    "gazzetta_ufficiale": {"trigger": "cron", "day_of_week": "mon,thu", "hour": 4},
}
