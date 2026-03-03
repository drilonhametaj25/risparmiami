export type PlanId = "free" | "personale" | "azienda" | "pdf";

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  mode: "subscription" | "payment";
  priceMonthly?: number;
  priceYearly?: number;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  stripePriceIdOneTime?: string;
  trialDays?: number;
  features: string[];
}

export const plans: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Gratis",
    description: "Scopri quanto puoi risparmiare",
    mode: "subscription",
    priceMonthly: 0,
    features: [
      "Quiz risparmio rapido",
      "3 consigli generici",
      "Accesso al blog",
    ],
  },
  personale: {
    id: "personale",
    name: "Personale",
    description: "Analisi completa e personalizzata",
    mode: "subscription",
    priceMonthly: 4.99,
    priceYearly: 47.88, // 3.99/mo
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PERSONALE_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_PERSONALE_YEARLY || "",
    trialDays: 7,
    features: [
      "Profilo completo",
      "100+ regole di risparmio",
      "7 aree di analisi",
      "Report PDF scaricabile",
      "Aggiornamenti automatici",
      "Alert email scadenze",
      "Tracciamento progressi",
    ],
  },
  azienda: {
    id: "azienda",
    name: "Azienda",
    description: "Incentivi e crediti d'imposta per la tua impresa",
    mode: "subscription",
    priceMonthly: 29,
    priceYearly: 278.40, // 23.20/mo
    stripePriceIdMonthly: process.env.STRIPE_PRICE_AZIENDA_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_AZIENDA_YEARLY || "",
    trialDays: 7,
    features: [
      "Tutto del piano Personale",
      "Incentivi imprese",
      "Crediti d'imposta",
      "Bandi regionali",
      "Supporto prioritario",
    ],
  },
  pdf: {
    id: "pdf",
    name: "Guida PDF Completa",
    description: "La guida definitiva al risparmio in Italia",
    mode: "payment",
    stripePriceIdOneTime: process.env.STRIPE_PRICE_PDF || "",
    features: [
      "80+ pagine di consigli",
      "7 capitoli tematici",
      "Aggiornata al 2026",
      "Download immediato",
    ],
  },
};

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(plans).find(
    (p) =>
      p.stripePriceIdMonthly === priceId ||
      p.stripePriceIdYearly === priceId ||
      p.stripePriceIdOneTime === priceId
  );
}
