import { z } from "zod";

export const step1Schema = z.object({
  birthYear: z.number().min(1940).max(2010).optional(),
  region: z.string().min(1, "Seleziona una regione"),
  province: z.string().optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  citizenship: z.string().default("IT"),
});

export const step2Schema = z.object({
  childrenCount: z.number().min(0).max(10).default(0),
  childrenAges: z.array(z.number().min(0).max(30)).default([]),
});

export const step3Schema = z.object({
  employmentType: z.enum(["dipendente", "autonomo", "pensionato", "disoccupato", "studente"]).optional(),
  contractType: z.enum(["indeterminato", "determinato", "partita_iva", "collaborazione"]).optional(),
  incomeRange: z.enum(["0-8000", "8000-15000", "15000-28000", "28000-50000", "50000-75000", "75000+"]).optional(),
  iseeRange: z.enum(["0-6000", "6000-9360", "9360-15000", "15000-25000", "25000-40000", "40000+"]).optional(),
  hasCommercialistaOrCaf: z.boolean().default(false),
});

export const step4Schema = z.object({
  housingType: z.enum(["proprietario", "affitto", "comodato", "altro"]).optional(),
  isPrimaryResidence: z.boolean().default(true),
  rentAmountRange: z.enum(["0-300", "300-500", "500-800", "800-1200", "1200+"]).optional(),
  hasMortgage: z.boolean().default(false),
  hasRenovatedRecently: z.boolean().default(false),
  renovationYear: z.number().optional(),
  heatingType: z.enum(["gas", "elettrico", "pompa_calore", "pellet", "altro"]).optional(),
});

export const step5Schema = z.object({
  electricityProvider: z.string().optional(),
  electricityBimonthly: z.enum(["0-50", "50-100", "100-200", "200-350", "350+"]).optional(),
  gasProvider: z.string().optional(),
  gasBimonthly: z.enum(["0-50", "50-100", "100-200", "200-350", "350+"]).optional(),
  bankName: z.string().optional(),
  accountType: z.enum(["conto_corrente", "conto_deposito", "conto_online", "libretto"]).optional(),
  estimatedBankCost: z.enum(["0-30", "30-60", "60-100", "100-200", "200+"]).optional(),
});

export const step6Schema = z.object({
  hasInsurance: z.boolean().default(false),
  insuranceTypes: z.array(z.string()).default([]),
  travelFrequency: z.enum(["mai", "1-2", "3-5", "5+"]).optional(),
  hasPets: z.boolean().default(false),
  medicalExpensesRange: z.enum(["0-200", "200-500", "500-1000", "1000-3000", "3000+"]).optional(),
  hasChildrenInSchool: z.boolean().default(false),
  hasChildrenInDaycare: z.boolean().default(false),
  subscriptionCount: z.enum(["0-2", "3-5", "6-10", "10+"]).optional(),
});

export const fullOnboardingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema);

export type OnboardingData = z.infer<typeof fullOnboardingSchema>;
