"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function StepWork({ data, onNext, onBack }: StepProps) {
  const [employmentType, setEmploymentType] = useState(data.employmentType || "");
  const [contractType, setContractType] = useState(data.contractType || "");
  const [incomeRange, setIncomeRange] = useState(data.incomeRange || "");
  const [iseeRange, setIseeRange] = useState(data.iseeRange || "");
  const [hasCommercialistaOrCaf, setHasCommercialistaOrCaf] = useState(
    data.hasCommercialistaOrCaf ?? false
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Tipo di impiego
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "dipendente", label: "Dipendente" },
            { value: "autonomo", label: "Autonomo" },
            { value: "pensionato", label: "Pensionato" },
            { value: "disoccupato", label: "Disoccupato" },
            { value: "studente", label: "Studente" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEmploymentType(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                employmentType === opt.value
                  ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                  : "border-border-light hover:border-accent-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {employmentType === "dipendente" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Tipo di contratto
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "indeterminato", label: "Indeterminato" },
              { value: "determinato", label: "Determinato" },
              { value: "collaborazione", label: "Collaborazione" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setContractType(opt.value)}
                className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                  contractType === opt.value
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

      {employmentType === "autonomo" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Tipo di contratto
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "partita_iva", label: "Partita IVA" },
              { value: "collaborazione", label: "Collaborazione" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setContractType(opt.value)}
                className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                  contractType === opt.value
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
          Fascia di reddito annuo lordo
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-8000", label: "Fino a 8.000 EUR" },
            { value: "8000-15000", label: "8.000 - 15.000 EUR" },
            { value: "15000-28000", label: "15.000 - 28.000 EUR" },
            { value: "28000-50000", label: "28.000 - 50.000 EUR" },
            { value: "50000-75000", label: "50.000 - 75.000 EUR" },
            { value: "75000+", label: "Oltre 75.000 EUR" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setIncomeRange(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                incomeRange === opt.value
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
          Fascia ISEE
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-6000", label: "Fino a 6.000 EUR" },
            { value: "6000-9360", label: "6.000 - 9.360 EUR" },
            { value: "9360-15000", label: "9.360 - 15.000 EUR" },
            { value: "15000-25000", label: "15.000 - 25.000 EUR" },
            { value: "25000-40000", label: "25.000 - 40.000 EUR" },
            { value: "40000+", label: "Oltre 40.000 EUR" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setIseeRange(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                iseeRange === opt.value
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
          Hai un commercialista o CAF?
        </label>
        <button
          type="button"
          onClick={() => setHasCommercialistaOrCaf(!hasCommercialistaOrCaf)}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            hasCommercialistaOrCaf
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {hasCommercialistaOrCaf ? "Si, ho un commercialista/CAF" : "No, non ho un commercialista/CAF"}
        </button>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} variant="secondary" className="flex-1">
            Indietro
          </Button>
        )}
        <Button
          onClick={() => onNext({
            employmentType: (employmentType) || undefined,
            contractType: (contractType) || undefined,
            incomeRange: (incomeRange) || undefined,
            iseeRange: (iseeRange) || undefined,
            hasCommercialistaOrCaf,
          })}
          className="flex-1"
        >
          Continua
        </Button>
      </div>
    </div>
  );
}
