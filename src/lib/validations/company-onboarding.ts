import { z } from "zod";

export const companyStep1Schema = z.object({
  companyName: z.string().min(1, "Inserisci il nome dell'azienda"),
  legalForm: z.enum(["srl", "spa", "sas", "snc", "ditta_individuale", "cooperativa", "altro"]).optional(),
  atecoCode: z.string().optional(),
  atecoDescription: z.string().optional(),
  region: z.string().min(1, "Seleziona una regione"),
  province: z.string().optional(),
  foundedYear: z.number().min(1900).max(2026).optional(),
});

export const companyStep2Schema = z.object({
  employeeCount: z.enum(["1-5", "6-15", "16-50", "51-250", "250+"]).optional(),
  revenueRange: z.enum(["0-100k", "100k-500k", "500k-2M", "2M-10M", "10M+"]).optional(),
});

export const companyStep3Schema = z.object({
  taxRegime: z.enum(["ordinario", "forfettario", "semplificato"]).optional(),
  hasAccountant: z.boolean().default(false),
  hasRequestedTaxCredits: z.boolean().default(false),
});

export const companyStep4Schema = z.object({
  investsInTraining: z.boolean().default(false),
  investsInRD: z.boolean().default(false),
  boughtEquipmentRecently: z.boolean().default(false),
  energyCostRange: z.enum(["0-500", "500-2000", "2000-5000", "5000-15000", "15000+"]).optional(),
  gasCostRange: z.enum(["0-500", "500-2000", "2000-5000", "5000-15000", "15000+"]).optional(),
  telecomCostRange: z.enum(["0-100", "100-500", "500-1000", "1000+"]).optional(),
  hasCompanyVehicles: z.boolean().default(false),
});

export const companyStep5Schema = z.object({
  offersWelfare: z.boolean().default(false),
  hasApprentices: z.boolean().default(false),
  hiredRecently: z.boolean().default(false),
  hiredYouth: z.boolean().default(false),
  hiredWomen: z.boolean().default(false),
  hiredDisadvantaged: z.boolean().default(false),
});

export const fullCompanyOnboardingSchema = companyStep1Schema
  .merge(companyStep2Schema)
  .merge(companyStep3Schema)
  .merge(companyStep4Schema)
  .merge(companyStep5Schema);

export type CompanyOnboardingData = z.infer<typeof fullCompanyOnboardingSchema>;
