"""Diff checker - compares scraped rules against existing database rules."""
import logging
import sys
import os
from dataclasses import dataclass, field

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from db import get_rules_by_source

logger = logging.getLogger(__name__)

DIFF_FIELDS = ["name", "shortDescription", "fullDescription", "maxAmount", "certaintyLevel", "howToClaim"]


@dataclass
class DiffResult:
    """Result of comparing new rules against existing database rules."""
    new: list[dict] = field(default_factory=list)
    updated: list[dict] = field(default_factory=list)
    unchanged: list[dict] = field(default_factory=list)
    expired: list[str] = field(default_factory=list)  # slugs of rules no longer found


class DiffChecker:
    """Compare scraped rules against existing database rules."""

    def check(self, new_rules: list[dict], source: str) -> DiffResult:
        """Compare new rules against existing ones in the DB for the same source."""
        result = DiffResult()

        # Get existing rules from DB
        existing = get_rules_by_source(source)
        existing_by_slug = {r["slug"]: r for r in existing}
        new_slugs = {r["slug"] for r in new_rules}

        for rule in new_rules:
            slug = rule["slug"]

            if slug not in existing_by_slug:
                result.new.append(rule)
                logger.info(f"NEW rule: {slug}")
            else:
                # Check if any key fields changed
                existing_rule = existing_by_slug[slug]
                changed = False
                changes = []

                for field_name in DIFF_FIELDS:
                    new_val = rule.get(field_name)
                    old_val = existing_rule.get(field_name)

                    # Normalize for comparison
                    if new_val is not None and old_val is not None:
                        new_str = str(new_val).strip()
                        old_str = str(old_val).strip()
                        if new_str != old_str:
                            changed = True
                            changes.append(f"{field_name}: '{old_str[:50]}...' -> '{new_str[:50]}...'")

                if changed:
                    rule["_changes"] = changes
                    result.updated.append(rule)
                    logger.info(f"UPDATED rule: {slug} ({', '.join(changes)})")
                else:
                    result.unchanged.append(rule)

        # Find expired rules (in DB but not in new scrape)
        for slug in existing_by_slug:
            if slug not in new_slugs:
                result.expired.append(slug)
                logger.info(f"EXPIRED rule: {slug}")

        logger.info(
            f"Diff result for {source}: "
            f"{len(result.new)} new, {len(result.updated)} updated, "
            f"{len(result.unchanged)} unchanged, {len(result.expired)} expired"
        )

        return result
