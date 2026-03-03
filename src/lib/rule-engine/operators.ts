import type { Operator } from "./types";

export function evaluateCondition(
  fieldValue: unknown,
  operator: Operator,
  conditionValue: string
): boolean {
  // "exists" operator just checks if value is truthy
  if (operator === "exists") {
    return conditionValue === "true"
      ? fieldValue !== null && fieldValue !== undefined && fieldValue !== "" && fieldValue !== false
      : fieldValue === null || fieldValue === undefined || fieldValue === "" || fieldValue === false;
  }

  if (fieldValue === null || fieldValue === undefined) return false;

  const numericFieldValue = typeof fieldValue === "number" ? fieldValue : parseFloat(String(fieldValue));
  const numericCondValue = parseFloat(conditionValue);

  switch (operator) {
    case "eq":
      return String(fieldValue).toLowerCase() === conditionValue.toLowerCase();

    case "neq":
      return String(fieldValue).toLowerCase() !== conditionValue.toLowerCase();

    case "gt":
      return !isNaN(numericFieldValue) && !isNaN(numericCondValue) && numericFieldValue > numericCondValue;

    case "gte":
      return !isNaN(numericFieldValue) && !isNaN(numericCondValue) && numericFieldValue >= numericCondValue;

    case "lt":
      return !isNaN(numericFieldValue) && !isNaN(numericCondValue) && numericFieldValue < numericCondValue;

    case "lte":
      return !isNaN(numericFieldValue) && !isNaN(numericCondValue) && numericFieldValue <= numericCondValue;

    case "in": {
      const allowedValues = conditionValue.split(",").map((v) => v.trim().toLowerCase());
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) => allowedValues.includes(String(v).toLowerCase()));
      }
      return allowedValues.includes(String(fieldValue).toLowerCase());
    }

    case "not_in": {
      const disallowedValues = conditionValue.split(",").map((v) => v.trim().toLowerCase());
      if (Array.isArray(fieldValue)) {
        return !fieldValue.some((v) => disallowedValues.includes(String(v).toLowerCase()));
      }
      return !disallowedValues.includes(String(fieldValue).toLowerCase());
    }

    case "between": {
      const [minStr, maxStr] = conditionValue.split(",").map((v) => v.trim());
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      return !isNaN(numericFieldValue) && numericFieldValue >= min && numericFieldValue <= max;
    }

    case "contains":
      return String(fieldValue).toLowerCase().includes(conditionValue.toLowerCase());

    case "range_overlaps": {
      // Field value is a range string like "15000-28000"
      // Condition value is "min,max"
      const fieldStr = String(fieldValue);
      const fieldParts = fieldStr.split("-").map((v) => parseFloat(v.trim()));
      const condParts = conditionValue.split(",").map((v) => parseFloat(v.trim()));
      if (fieldParts.length >= 2 && condParts.length >= 2) {
        return fieldParts[0] <= condParts[1] && fieldParts[1] >= condParts[0];
      }
      return false;
    }

    default:
      return false;
  }
}
