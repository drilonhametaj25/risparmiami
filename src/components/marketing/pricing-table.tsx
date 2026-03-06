"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

const PLANS = [
  {
    name: "Guida PDF",
    description: "Tutto in un documento completo",
    price: { monthly: 19, yearly: 19 },
    isOneTime: true,
    cta: "Acquista",
    href: "/guida-pdf",
    popular: false,
    features: [
      "Guida 80+ pagine",
      "Checklist complete",
      "Template pronti",
      "Aggiornamenti 12 mesi via email",
    ],
  },
  {
    name: "Personale",
    description: "Il tuo assistente al risparmio",
    price: { monthly: 4.99, yearly: 49.99 },
    isOneTime: false,
    cta: "Inizia prova gratuita",
    href: "/registrati",
    popular: true,
    features: [
      "Tutto del PDF",
      "Dashboard personalizzata",
      "Tutti i risultati per categoria",
      "Tracciamento bollette e abbonamenti",
      "Suggerimenti su misura",
      "Aggiornamento profilo illimitato",
    ],
  },
  {
    name: "Azienda",
    description: "Risparmio per la tua impresa",
    price: { monthly: 29, yearly: 290 },
    isOneTime: false,
    cta: "Contattaci",
    href: "/registrati",
    popular: false,
    features: [
      "Tutto del Personale",
      "Crediti d'imposta e incentivi",
      "Profilo aziendale completo",
      "Incentivi assunzione",
      "Matching regole impresa",
    ],
  },
];

function PricingTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <SectionWrapper id="prezzi">
      <AnimatedSection>
        <div className="text-center mb-12">
          <h2 className="font-heading text-h1 text-text-primary">
            Scegli il tuo piano
          </h2>
          <p className="mt-3 text-body text-text-secondary">
            Inizia gratis. Upgrade quando vuoi. Cancella quando vuoi.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-bg-secondary rounded-full p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                !yearly ? "bg-white text-text-primary shadow-sm" : "text-text-secondary"
              )}
            >
              Mensile
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                yearly ? "bg-white text-text-primary shadow-sm" : "text-text-secondary"
              )}
            >
              Annuale
              <span className="ml-1.5 text-xs text-accent-success">-17%</span>
            </button>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => (
          <AnimatedSection key={plan.name} delay={i * 0.1}>
            <Card
              padding="lg"
              className={cn(
                "h-full flex flex-col",
                plan.popular && "border-accent-primary border-2 relative"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                    Piu popolare
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-heading text-h3 text-text-primary">{plan.name}</h3>
                <p className="text-small text-text-secondary mt-1">{plan.description}</p>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-bold text-text-primary">
                    &euro;{yearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {!plan.isOneTime && (
                    <span className="text-sm text-text-muted">
                      /{yearly ? "anno" : "mese"}
                    </span>
                  )}
                </div>
                {plan.isOneTime && (
                  <p className="text-xs text-text-muted mt-1">Pagamento unico</p>
                )}
                {!plan.isOneTime && yearly && plan.name === "Personale" && (
                  <p className="text-xs text-accent-success mt-1">Risparmi 2 mesi</p>
                )}
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-accent-success flex-shrink-0 mt-0.5" />
                    <span className="text-small text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}

export { PricingTable };
