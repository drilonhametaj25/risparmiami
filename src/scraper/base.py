"""Base scraper class."""
import time
import logging
from abc import ABC, abstractmethod
from db import log_scraper_run

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Base class for all scrapers."""

    name: str = "base"
    source_url: str = ""

    def run(self):
        """Execute the full scraping pipeline."""
        start = time.time()
        try:
            logger.info(f"Starting scraper: {self.name}")

            # 1. Fetch data from source
            raw_data = self.fetch()

            # 2. Extract structured rules
            rules = self.extract(raw_data)

            # 3. Diff against existing rules
            new_rules, updated_rules = self.diff(rules)

            # 4. Apply changes
            self.apply(new_rules, updated_rules)

            duration = int((time.time() - start) * 1000)
            log_scraper_run(
                source=self.name,
                status="success",
                rules_found=len(rules),
                rules_new=len(new_rules),
                rules_updated=len(updated_rules),
                duration=duration,
            )
            logger.info(f"Scraper {self.name} completed: {len(rules)} found, {len(new_rules)} new, {len(updated_rules)} updated")

        except Exception as e:
            duration = int((time.time() - start) * 1000)
            log_scraper_run(
                source=self.name,
                status="error",
                error_message=str(e),
                duration=duration,
            )
            logger.error(f"Scraper {self.name} failed: {e}")
            raise

    @abstractmethod
    def fetch(self) -> dict:
        """Fetch data from the source."""
        pass

    @abstractmethod
    def extract(self, raw_data: dict) -> list[dict]:
        """Extract structured rules from raw data."""
        pass

    def diff(self, rules: list[dict]) -> tuple[list[dict], list[dict]]:
        """Compare rules against existing database entries."""
        # Default: treat all as potentially new/updated
        return rules, []

    def apply(self, new_rules: list[dict], updated_rules: list[dict]):
        """Apply changes to the database."""
        from db import upsert_rule_with_requirements
        for rule in new_rules + updated_rules:
            # Ensure all required fields have defaults
            rule.setdefault("howToClaim", "")
            rule.setdefault("requiredDocs", [])
            rule.setdefault("tags", [])
            rule.setdefault("requirements", [])
            rule.setdefault("sourceName", self.name)
            rule.setdefault("maxAmount", None)
            rule.setdefault("certaintyLevel", "probabile")
            rule.setdefault("target", "persona")
            upsert_rule_with_requirements(rule)
