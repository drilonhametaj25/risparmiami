import type { Rule, RuleRequirement, UserProfile, CompanyProfile } from "@prisma/client";

export type CertaintyLevel = "certo" | "probabile" | "consiglio";

export type Operator =
  | "eq" | "neq"
  | "gt" | "gte" | "lt" | "lte"
  | "in" | "not_in"
  | "exists"
  | "between"
  | "contains"
  | "range_overlaps";

export interface RuleWithRequirements extends Rule {
  requirements: RuleRequirement[];
}

export interface MatchResult {
  ruleId: string;
  rule: RuleWithRequirements;
  estimatedSaving: number | null;
  certainty: CertaintyLevel;
  matchScore: number;
  matchedRequirements: number;
  totalRequirements: number;
}

export type ProfileData = Partial<UserProfile> & Partial<CompanyProfile> & Record<string, unknown>;
