import type { RuleWithRequirements, MatchResult, ProfileData, CertaintyLevel, Operator } from "./types";
import { evaluateCondition } from "./operators";

function getFieldValue(profile: ProfileData, field: string): unknown {
  // Support dot notation for nested fields
  const parts = field.split(".");
  let value: unknown = profile;
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

function calculateCertainty(
  rule: RuleWithRequirements,
  matchedRequired: number,
  totalRequired: number,
  matchedOptional: number,
  totalOptional: number
): CertaintyLevel {
  // If the rule has a declared certainty level, use it as base
  const baseCertainty = rule.certaintyLevel as CertaintyLevel;

  // If all required are met and at least half optional, return base certainty
  if (matchedRequired === totalRequired) {
    if (totalOptional === 0 || matchedOptional >= totalOptional * 0.5) {
      return baseCertainty;
    }
    // All required but few optional met - downgrade one level
    return baseCertainty === "certo" ? "probabile" : "consiglio";
  }

  return "consiglio";
}

export function evaluateRule(
  rule: RuleWithRequirements,
  profile: ProfileData
): MatchResult | null {
  const requiredReqs = rule.requirements.filter((r) => r.isRequired);
  const optionalReqs = rule.requirements.filter((r) => !r.isRequired);

  let matchedRequired = 0;
  let matchedOptional = 0;

  // Check all required requirements
  for (const req of requiredReqs) {
    const fieldValue = getFieldValue(profile, req.field);
    if (evaluateCondition(fieldValue, req.operator as Operator, req.value)) {
      matchedRequired++;
    } else {
      // Required condition not met - rule doesn't match
      return null;
    }
  }

  // Check optional requirements
  for (const req of optionalReqs) {
    const fieldValue = getFieldValue(profile, req.field);
    if (evaluateCondition(fieldValue, req.operator as Operator, req.value)) {
      matchedOptional++;
    }
  }

  const totalReqs = requiredReqs.length + optionalReqs.length;
  const totalMatched = matchedRequired + matchedOptional;
  const matchScore = totalReqs > 0 ? totalMatched / totalReqs : 1;

  const certainty = calculateCertainty(
    rule,
    matchedRequired,
    requiredReqs.length,
    matchedOptional,
    optionalReqs.length
  );

  // Estimate savings (round to 2 decimals for monetary precision)
  // Cap at €50,000 to prevent inflated scraper values from distorting totals
  const MAX_ESTIMATED_SAVING = 50_000;
  let estimatedSaving: number | null = null;
  if (rule.maxAmount) {
    estimatedSaving = Math.min(rule.maxAmount.toNumber(), MAX_ESTIMATED_SAVING);
    if (rule.percentage) {
      estimatedSaving = Math.round(estimatedSaving * (rule.percentage.toNumber() / 100) * 100) / 100;
    }
  }

  return {
    ruleId: rule.id,
    rule,
    estimatedSaving,
    certainty,
    matchScore,
    matchedRequirements: totalMatched,
    totalRequirements: totalReqs,
  };
}

export function evaluateAllRules(
  rules: RuleWithRequirements[],
  profile: ProfileData,
  target: "persona" | "azienda" = "persona"
): MatchResult[] {
  const now = new Date();

  return rules
    .filter((rule) => {
      if (!rule.isActive) return false;
      if (rule.target !== target && rule.target !== "entrambi") return false;
      if (rule.validFrom && new Date(rule.validFrom) > now) return false;
      if (rule.validUntil && new Date(rule.validUntil) < now) return false;
      // Skip rules with no requirements — they match everyone indiscriminately
      if (rule.requirements.length === 0) return false;
      return true;
    })
    .map((rule) => evaluateRule(rule, profile))
    .filter((result): result is MatchResult => result !== null)
    .sort((a, b) => {
      // Sort by certainty (certo > probabile > consiglio) then by savings desc
      const certaintyOrder = { certo: 0, probabile: 1, consiglio: 2 };
      const certDiff = certaintyOrder[a.certainty] - certaintyOrder[b.certainty];
      if (certDiff !== 0) return certDiff;
      return (b.estimatedSaving || 0) - (a.estimatedSaving || 0);
    });
}
