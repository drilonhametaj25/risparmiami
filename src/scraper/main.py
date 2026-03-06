"""Main entry point for the RisparmiaMi scraper system."""
import argparse
import logging
import os
import sys
import requests
from config import SCRAPER_LOG_LEVEL, SCHEDULES

logging.basicConfig(
    level=getattr(logging, SCRAPER_LOG_LEVEL),
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

logger = logging.getLogger(__name__)

# Registry of all available scrapers
SCRAPER_REGISTRY = {
    "normattiva": ("scrapers.normattiva", "NormattivaScraper"),
    "agenzia_entrate": ("scrapers.agenzia_entrate", "AgenziaEntrateScraper"),
    "arera": ("scrapers.arera", "ARERAScraper"),
    "banca_italia": ("scrapers.banca_italia", "BancaItaliaScraper"),
    "inps": ("scrapers.inps", "INPSScraper"),
    "incentivi_gov": ("scrapers.incentivi_gov", "IncentiviGovScraper"),
    "trasporti": ("scrapers.trasporti", "TrasportiScraper"),
    "normattiva_codici": ("scrapers.normattiva_codici", "NormattivaCodiciScraper"),
    "normattiva_recenti": ("scrapers.normattiva_recenti", "NormattivaRecentiScraper"),
    "gazzetta_ufficiale": ("scrapers.gazzetta_ufficiale", "GazzettaUfficialeScraper"),
}


def trigger_rematch():
    """Trigger user re-matching after rules update."""
    try:
        url = os.getenv("NEXTAUTH_URL", "http://app:3000") + "/api/cron/rematch-users"
        headers = {"Authorization": f"Bearer {os.getenv('CRON_SECRET', '')}"}
        response = requests.get(url, headers=headers, timeout=120)
        if response.ok:
            data = response.json()
            logger.info(f"Re-matching triggered: {data.get('rematched', 0)} users updated")
        else:
            logger.warning(f"Re-matching failed: {response.status_code}")
    except Exception as e:
        logger.warning(f"Re-matching error: {e}")


def get_scraper(name: str):
    """Dynamically import and instantiate a scraper by name."""
    if name not in SCRAPER_REGISTRY:
        raise ValueError(f"Unknown scraper: {name}. Available: {list(SCRAPER_REGISTRY.keys())}")

    module_path, class_name = SCRAPER_REGISTRY[name]
    module = __import__(module_path, fromlist=[class_name])
    scraper_class = getattr(module, class_name)
    return scraper_class()


def run_single(name: str, dry_run: bool = False, rematch: bool = True):
    """Run a single scraper by name."""
    logger.info(f"Running scraper: {name}")
    scraper = get_scraper(name)

    if dry_run:
        logger.info(f"[DRY RUN] Scraper '{name}' initialized successfully")
        logger.info(f"  - Class: {scraper.__class__.__name__}")
        logger.info(f"  - Source URL: {scraper.source_url}")
        return

    scraper.run()

    # Trigger re-matching after successful scraper run
    if rematch:
        trigger_rematch()


def run_all(dry_run: bool = False):
    """Run all scrapers sequentially. One failure doesn't block others."""
    logger.info("Starting all scrapers...")
    results = {}

    for name in SCRAPER_REGISTRY:
        try:
            run_single(name, dry_run=dry_run, rematch=False)
            results[name] = "success"
        except Exception as e:
            logger.error(f"Scraper '{name}' failed: {e}")
            results[name] = f"error: {e}"

    logger.info("All scrapers finished. Results:")
    for name, status in results.items():
        logger.info(f"  {name}: {status}")

    # Trigger re-matching once after all scrapers complete
    if not dry_run and any(s == "success" for s in results.values()):
        trigger_rematch()


def run_scheduler():
    """Run scrapers on their configured schedules using APScheduler."""
    try:
        from apscheduler.schedulers.blocking import BlockingScheduler
    except ImportError:
        logger.error("APScheduler not installed. Run: pip install apscheduler")
        sys.exit(1)

    scheduler = BlockingScheduler()

    for name, schedule_config in SCHEDULES.items():
        if name in SCRAPER_REGISTRY:
            scheduler.add_job(
                run_single,
                args=[name],
                id=f"scraper_{name}",
                name=f"Scraper: {name}",
                **schedule_config,
            )
            logger.info(f"Scheduled scraper '{name}' with config: {schedule_config}")

    logger.info("Scheduler started. Press Ctrl+C to stop.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")


def main():
    parser = argparse.ArgumentParser(
        description="RisparmiaMi Scraper Engine - Collects rules from Italian government portals"
    )
    parser.add_argument(
        "--scraper",
        choices=list(SCRAPER_REGISTRY.keys()),
        help="Run a specific scraper",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all scrapers",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Initialize scrapers without actually fetching data",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Run scrapers on their configured schedules (daemon mode)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available scrapers",
    )

    args = parser.parse_args()

    if args.list:
        print("Available scrapers:")
        for name in SCRAPER_REGISTRY:
            schedule = SCHEDULES.get(name, {})
            print(f"  {name:20s} schedule: {schedule}")
        return

    if args.schedule:
        run_scheduler()
    elif args.scraper:
        run_single(args.scraper, dry_run=args.dry_run)
    elif args.all:
        run_all(dry_run=args.dry_run)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
