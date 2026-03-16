import type { OnboardingData } from "@/lib/validations/onboarding";
import type { CompanyOnboardingData } from "@/lib/validations/company-onboarding";

// Use Record<string, unknown> for step data since DB values come as
// plain strings that don't satisfy the Zod enum types exactly.
// Each step component validates its own subset via Zod schemas.
export type PersonalOnboardingStepData = Record<string, unknown>;
export type CompanyOnboardingStepData = Record<string, unknown>;

export type { OnboardingData, CompanyOnboardingData };
