"""Database connection and operations for the scraper."""
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL
import logging

logger = logging.getLogger(__name__)


def get_connection():
    """Get a database connection."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def log_scraper_run(source: str, status: str, rules_found: int = 0,
                     rules_new: int = 0, rules_updated: int = 0,
                     error_message: str = None, duration: int = 0):
    """Log a scraper run to the ScraperLog table."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO "ScraperLog" (id, source, status, "rulesFound", "rulesNew",
                    "rulesUpdated", "errorMessage", duration, "runAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (source, status, rules_found, rules_new, rules_updated,
                  error_message, duration))
        conn.commit()
    finally:
        conn.close()


def upsert_rule(rule_data: dict):
    """Upsert a rule into the database."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO "Rule" (id, slug, name, "shortDescription", "fullDescription",
                    category, target, "maxAmount", "certaintyLevel", "howToClaim",
                    "requiredDocs", tags, "isActive", "lastVerified", version,
                    "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %(slug)s, %(name)s, %(shortDescription)s,
                    %(fullDescription)s, %(category)s, %(target)s, %(maxAmount)s,
                    %(certaintyLevel)s, %(howToClaim)s, %(requiredDocs)s, %(tags)s,
                    true, NOW(), 1, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    "shortDescription" = EXCLUDED."shortDescription",
                    "fullDescription" = EXCLUDED."fullDescription",
                    "maxAmount" = EXCLUDED."maxAmount",
                    "lastVerified" = NOW(),
                    version = "Rule".version + 1,
                    "updatedAt" = NOW()
                RETURNING id, (xmax = 0) as is_new
            """, rule_data)
            result = cur.fetchone()
            conn.commit()
            return result
    finally:
        conn.close()


def get_rules_by_source(source: str) -> list[dict]:
    """Get all active rules for a given source.

    Args:
        source: The sourceName to filter by.

    Returns:
        List of rule dicts.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, slug, name, "shortDescription", "fullDescription",
                       category, target, "maxAmount", "certaintyLevel",
                       "howToClaim", "requiredDocs", tags, "isActive",
                       "lastVerified", version, "sourceName"
                FROM "Rule"
                WHERE "sourceName" = %s AND "isActive" = true
            """, (source,))
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def mark_rules_expired(slugs: list[str]):
    """Mark rules as inactive (expired) by their slugs.

    Args:
        slugs: List of rule slugs to mark as expired.
    """
    if not slugs:
        return

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE "Rule"
                SET "isActive" = false, "updatedAt" = NOW()
                WHERE slug = ANY(%s)
            """, (slugs,))
            affected = cur.rowcount
            logger.info(f"Marked {affected} rules as expired: {slugs}")
        conn.commit()
    finally:
        conn.close()


def upsert_rule_with_requirements(rule_data: dict):
    """Upsert a Rule and its RuleRequirements in a single transaction.

    Inserts or updates the Rule row, then deletes old requirements
    and inserts new ones.

    Args:
        rule_data: Dict with rule fields and a 'requirements' key
                   containing a list of requirement dicts.

    Returns:
        The upserted rule row (id, is_new).
    """
    requirements = rule_data.pop("requirements", [])
    # Remove internal fields that are not DB columns
    rule_data.pop("_changes", None)
    rule_data.pop("percentage", None)

    # Ensure required fields have defaults (handle both missing and None)
    if not rule_data.get("howToClaim"):
        rule_data["howToClaim"] = ""
    if not rule_data.get("requiredDocs"):
        rule_data["requiredDocs"] = []
    if not rule_data.get("tags"):
        rule_data["tags"] = []
    if not rule_data.get("sourceName"):
        rule_data["sourceName"] = "unknown"
    if not rule_data.get("target"):
        rule_data["target"] = "persona"
    if not rule_data.get("certaintyLevel"):
        rule_data["certaintyLevel"] = "probabile"
    rule_data.setdefault("maxAmount", None)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Upsert the Rule
            cur.execute("""
                INSERT INTO "Rule" (id, slug, name, "shortDescription", "fullDescription",
                    category, target, "maxAmount", "certaintyLevel", "howToClaim",
                    "requiredDocs", tags, "sourceName", "isActive", "lastVerified",
                    version, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %(slug)s, %(name)s, %(shortDescription)s,
                    %(fullDescription)s, %(category)s, %(target)s, %(maxAmount)s,
                    %(certaintyLevel)s, %(howToClaim)s, %(requiredDocs)s, %(tags)s,
                    %(sourceName)s, true, NOW(), 1, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    "shortDescription" = EXCLUDED."shortDescription",
                    "fullDescription" = EXCLUDED."fullDescription",
                    "maxAmount" = EXCLUDED."maxAmount",
                    "certaintyLevel" = EXCLUDED."certaintyLevel",
                    "howToClaim" = EXCLUDED."howToClaim",
                    "requiredDocs" = EXCLUDED."requiredDocs",
                    tags = EXCLUDED.tags,
                    "sourceName" = EXCLUDED."sourceName",
                    "isActive" = true,
                    "lastVerified" = NOW(),
                    version = "Rule".version + 1,
                    "updatedAt" = NOW()
                RETURNING id, (xmax = 0) as is_new
            """, rule_data)
            result = cur.fetchone()
            rule_id = result["id"]

            # Delete old requirements for this rule
            cur.execute("""
                DELETE FROM "RuleRequirement"
                WHERE "ruleId" = %s
            """, (rule_id,))

            # Insert new requirements
            for req in requirements:
                cur.execute("""
                    INSERT INTO "RuleRequirement" (id, "ruleId", field, operator, value, "isRequired")
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, %s)
                """, (
                    rule_id,
                    req.get("field"),
                    req.get("operator"),
                    req.get("value") if isinstance(req.get("value"), str) else str(req.get("value", "")),
                    req.get("isRequired", True),
                ))

            logger.info(f"Upserted rule '{rule_data.get('slug')}' with {len(requirements)} requirements")

        conn.commit()
        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
