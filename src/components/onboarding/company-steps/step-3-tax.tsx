"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

const TAX_REGIMES = [
  { value: "ordinario", label: "Ordinario" },
  { value: "forfettario", label: "Forfettario" },
  { value: "semplificato", label: "Semplificato" },
];

export function CompanyStepTax({ data, onNext, onBack }: StepProps) {
  const [taxRegime, setTaxRegime] = useState(data.taxRegime || "");
  const [hasAccountant, setHasAccountant] = useState(data.hasAccountant ?? false);
  const [hasRequestedTaxCredits, setHasRequestedTaxCredits] = useState(data.hasRequestedTaxCredits ?? false);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Regime fiscale</label>
        <div className="grid grid-cols-3 gap-3">
          {TAX_REGIMES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTaxRegime(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                taxRegime === opt.value
                  ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                  : "border-border-light hover:border-accent-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Hai un commercialista?</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ value: true, label: "Si" }, { value: false, label: "No" }].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setHasAccountant(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                hasAccountant === opt.value
                  ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                  : "border-border-light hover:border-accent-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Hai già richiesto crediti d&apos;imposta?</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ value: true, label: "Si" }, { value: false, label: "No" }].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setHasRequestedTaxCredits(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                hasRequestedTaxCredits === opt.value
                  ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                  : "border-border-light hover:border-accent-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Indietro</Button>
        <Button onClick={() => onNext({ taxRegime: taxRegime || undefined, hasAccountant, hasRequestedTaxCredits })} className="flex-1">Continua</Button>
      </div>
    </div>
  );
}
