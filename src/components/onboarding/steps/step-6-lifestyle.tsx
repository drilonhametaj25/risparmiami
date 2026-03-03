"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


const INSURANCE_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "casa", label: "Casa" },
  { value: "vita", label: "Vita" },
  { value: "salute", label: "Salute" },
  { value: "infortuni", label: "Infortuni" },
  { value: "viaggio", label: "Viaggio" },
  { value: "animali", label: "Animali domestici" },
  { value: "professionale", label: "Professionale" },
];

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function StepLifestyle({ data, onNext, onBack, isPending }: StepProps) {
  const [hasInsurance, setHasInsurance] = useState(data.hasInsurance ?? false);
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>(
    data.insuranceTypes ?? []
  );
  const [travelFrequency, setTravelFrequency] = useState(data.travelFrequency || "");
  const [hasPets, setHasPets] = useState(data.hasPets ?? false);
  const [medicalExpensesRange, setMedicalExpensesRange] = useState(
    data.medicalExpensesRange || ""
  );
  const [hasChildrenInSchool, setHasChildrenInSchool] = useState(
    data.hasChildrenInSchool ?? false
  );
  const [hasChildrenInDaycare, setHasChildrenInDaycare] = useState(
    data.hasChildrenInDaycare ?? false
  );
  const [subscriptionCount, setSubscriptionCount] = useState(
    data.subscriptionCount || ""
  );

  function toggleInsuranceType(type: string) {
    setInsuranceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Hai assicurazioni attive?
        </label>
        <button
          type="button"
          onClick={() => {
            setHasInsurance(!hasInsurance);
            if (hasInsurance) setInsuranceTypes([]);
          }}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            hasInsurance
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {hasInsurance ? "Si, ho assicurazioni attive" : "No, nessuna assicurazione"}
        </button>
      </div>

      {hasInsurance && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Tipi di assicurazione
          </label>
          <div className="grid grid-cols-2 gap-3">
            {INSURANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleInsuranceType(opt.value)}
                className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                  insuranceTypes.includes(opt.value)
                    ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                    : "border-border-light hover:border-accent-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Frequenza viaggi all&apos;anno
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "mai", label: "Mai" },
            { value: "1-2", label: "1-2 volte" },
            { value: "3-5", label: "3-5 volte" },
            { value: "5+", label: "Oltre 5 volte" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTravelFrequency(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                travelFrequency === opt.value
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
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Hai animali domestici?
        </label>
        <button
          type="button"
          onClick={() => setHasPets(!hasPets)}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            hasPets
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {hasPets ? "Si, ho animali domestici" : "No, nessun animale domestico"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Spese mediche annuali stimate
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-200", label: "Fino a 200 EUR" },
            { value: "200-500", label: "200 - 500 EUR" },
            { value: "500-1000", label: "500 - 1.000 EUR" },
            { value: "1000-3000", label: "1.000 - 3.000 EUR" },
            { value: "3000+", label: "Oltre 3.000 EUR" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMedicalExpensesRange(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                medicalExpensesRange === opt.value
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
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Hai figli a scuola?
        </label>
        <button
          type="button"
          onClick={() => setHasChildrenInSchool(!hasChildrenInSchool)}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            hasChildrenInSchool
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {hasChildrenInSchool ? "Si, ho figli a scuola" : "No"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Hai figli all&apos;asilo nido?
        </label>
        <button
          type="button"
          onClick={() => setHasChildrenInDaycare(!hasChildrenInDaycare)}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            hasChildrenInDaycare
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {hasChildrenInDaycare ? "Si, ho figli all'asilo nido" : "No"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Quanti abbonamenti hai? (streaming, palestra, ecc.)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-2", label: "0-2" },
            { value: "3-5", label: "3-5" },
            { value: "6-10", label: "6-10" },
            { value: "10+", label: "Oltre 10" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSubscriptionCount(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                subscriptionCount === opt.value
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
        {onBack && (
          <Button onClick={onBack} variant="secondary" className="flex-1">
            Indietro
          </Button>
        )}
        <Button
          onClick={() => onNext({
            hasInsurance,
            insuranceTypes: hasInsurance ? insuranceTypes : [],
            travelFrequency: (travelFrequency) || undefined,
            hasPets,
            medicalExpensesRange: (medicalExpensesRange) || undefined,
            hasChildrenInSchool,
            hasChildrenInDaycare,
            subscriptionCount: (subscriptionCount) || undefined,
          })}
          className="flex-1"
          disabled={isPending}
        >
          {isPending ? "Salvataggio..." : "Completa"}
        </Button>
      </div>
    </div>
  );
}
