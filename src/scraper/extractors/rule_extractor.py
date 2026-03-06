"""Rule extraction using Claude API and PDF extractor."""
import json
import logging
import re
import sys
import os

# Add parent dir to path for sibling imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from claude_client import extract_rules_from_text
from extractors.pdf_extractor import PdfExtractor

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = {"slug", "name", "shortDescription", "category", "target", "certaintyLevel"}
VALID_OPERATORS = {"eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in", "exists", "between", "contains", "range_overlaps"}
VALID_CATEGORIES = {"detrazioni", "bonus-inps", "bollette", "banca", "trasporti", "isee", "incentivi", "abbonamenti"}
VALID_TARGETS = {"persona", "azienda", "entrambi"}
VALID_CERTAINTY = {"certo", "probabile", "consiglio"}


def validate_rule(rule: dict) -> tuple[bool, list[str]]:
    """Validate a rule dict against the expected schema."""
    errors = []

    for field in REQUIRED_FIELDS:
        if field not in rule or not rule[field]:
            errors.append(f"Missing required field: {field}")

    if rule.get("category") and rule["category"] not in VALID_CATEGORIES:
        errors.append(f"Invalid category: {rule['category']}")

    if rule.get("target") and rule["target"] not in VALID_TARGETS:
        errors.append(f"Invalid target: {rule['target']}")

    if rule.get("certaintyLevel") and rule["certaintyLevel"] not in VALID_CERTAINTY:
        errors.append(f"Invalid certaintyLevel: {rule['certaintyLevel']}")

    # Validate optional date fields (ISO format YYYY-MM-DD)
    iso_date_re = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    for date_field in ("validFrom", "validUntil", "deadline"):
        val = rule.get(date_field)
        if val is not None and val != "" and not iso_date_re.match(str(val)):
            errors.append(f"Invalid date format for {date_field}: {val} (expected YYYY-MM-DD)")

    # Validate requirements
    for req in rule.get("requirements", []):
        if "field" not in req or "operator" not in req or "value" not in req:
            errors.append(f"Requirement missing field/operator/value: {req}")
        elif req["operator"] not in VALID_OPERATORS:
            errors.append(f"Invalid operator in requirement: {req['operator']}")

    return len(errors) == 0, errors


def extract_from_pdf(pdf_path: str, source: str, category: str) -> list[dict]:
    """Extract rules from a PDF file using pdfplumber + Claude API."""
    text = PdfExtractor.extract_text(pdf_path)

    if not text.strip():
        logger.warning(f"No text extracted from PDF: {pdf_path}")
        return []

    # Truncate very long texts to avoid token limits
    max_chars = 100_000
    if len(text) > max_chars:
        logger.warning(f"Truncating text from {len(text)} to {max_chars} chars")
        text = text[:max_chars]

    rules = extract_rules_from_text(text, source, category)

    # Validate each rule
    valid_rules = []
    for rule in rules:
        is_valid, errors = validate_rule(rule)
        if is_valid:
            rule["sourceName"] = source
            valid_rules.append(rule)
        else:
            logger.warning(f"Invalid rule '{rule.get('slug', 'unknown')}': {errors}")

    logger.info(f"Extracted {len(valid_rules)}/{len(rules)} valid rules from {pdf_path}")
    return valid_rules


def extract_from_html(html: str, source: str, category: str) -> list[dict]:
    """Extract rules from HTML text using Claude API."""
    if not html.strip():
        return []

    # Strip HTML tags for cleaner text (basic approach)
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator="\n", strip=True)

    max_chars = 100_000
    if len(text) > max_chars:
        text = text[:max_chars]

    rules = extract_rules_from_text(text, source, category)

    valid_rules = []
    for rule in rules:
        is_valid, errors = validate_rule(rule)
        if is_valid:
            rule["sourceName"] = source
            valid_rules.append(rule)
        else:
            logger.warning(f"Invalid rule '{rule.get('slug', 'unknown')}': {errors}")

    logger.info(f"Extracted {len(valid_rules)}/{len(rules)} valid rules from HTML ({source})")
    return valid_rules


def save_rules_json(rules: list[dict], output_path: str):
    """Save extracted rules to a JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(rules)} rules to {output_path}")
