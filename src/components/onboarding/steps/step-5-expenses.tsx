"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function StepExpenses({ data, onNext, onBack }: StepProps) {
  const [electricityBimonthly, setElectricityBimonthly] = useState(
    data.electricityBimonthly || ""
  );
  const [gasBimonthly, setGasBimonthly] = useState(data.gasBimonthly || "");
  const [bankName, setBankName] = useState(data.bankName || "");
  const [accountType, setAccountType] = useState(data.accountType || "");
  const [estimatedBankCost, setEstimatedBankCost] = useState(
    data.estimatedBankCost || ""
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Bolletta luce bimestrale
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-50", label: "Fino a 50 EUR" },
            { value: "50-100", label: "50 - 100 EUR" },
            { value: "100-200", label: "100 - 200 EUR" },
            { value: "200-350", label: "200 - 350 EUR" },
            { value: "350+", label: "Oltre 350 EUR" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setElectricityBimonthly(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                electricityBimonthly === opt.value
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
          Bolletta gas bimestrale
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-50", label: "Fino a 50 EUR" },
            { value: "50-100", label: "50 - 100 EUR" },
            { value: "100-200", label: "100 - 200 EUR" },
            { value: "200-350", label: "200 - 350 EUR" },
            { value: "350+", label: "Oltre 350 EUR" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGasBimonthly(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                gasBimonthly === opt.value
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
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Nome della banca
        </label>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="es. Intesa Sanpaolo, UniCredit..."
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Tipo di conto
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "conto_corrente", label: "Conto corrente" },
            { value: "conto_deposito", label: "Conto deposito" },
            { value: "conto_online", label: "Conto online" },
            { value: "libretto", label: "Libretto" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAccountType(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                accountType === opt.value
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
          Costo stimato del conto (annuo)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "0-30", label: "Fino a 30 EUR" },
            { value: "30-60", label: "30 - 60 EUR" },
            { value: "60-100", label: "60 - 100 EUR" },
            { value: "100-200", label: "100 - 200 EUR" },
            { value: "200+", label: "Oltre 200 EUR" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEstimatedBankCost(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                estimatedBankCost === opt.value
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
            electricityBimonthly: (electricityBimonthly) || undefined,
            gasBimonthly: (gasBimonthly) || undefined,
            bankName: bankName || undefined,
            accountType: (accountType) || undefined,
            estimatedBankCost: (estimatedBankCost) || undefined,
          })}
          className="flex-1"
        >
          Continua
        </Button>
      </div>
    </div>
  );
}
