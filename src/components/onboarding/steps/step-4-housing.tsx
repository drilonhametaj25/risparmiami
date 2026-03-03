"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function StepHousing({ data, onNext, onBack }: StepProps) {
  const [housingType, setHousingType] = useState(data.housingType || "");
  const [isPrimaryResidence, setIsPrimaryResidence] = useState(
    data.isPrimaryResidence ?? true
  );
  const [rentAmountRange, setRentAmountRange] = useState(data.rentAmountRange || "");
  const [hasMortgage, setHasMortgage] = useState(data.hasMortgage ?? false);
  const [hasRenovatedRecently, setHasRenovatedRecently] = useState(
    data.hasRenovatedRecently ?? false
  );
  const [renovationYear, setRenovationYear] = useState(
    data.renovationYear?.toString() || ""
  );
  const [heatingType, setHeatingType] = useState(data.heatingType || "");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Tipo di abitazione
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "proprietario", label: "Proprietario" },
            { value: "affitto", label: "Affitto" },
            { value: "comodato", label: "Comodato" },
            { value: "altro", label: "Altro" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setHousingType(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                housingType === opt.value
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
          Residenza principale?
        </label>
        <button
          type="button"
          onClick={() => setIsPrimaryResidence(!isPrimaryResidence)}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            isPrimaryResidence
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {isPrimaryResidence ? "Si, e la mia residenza principale" : "No, non e la mia residenza principale"}
        </button>
      </div>

      {housingType === "affitto" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Canone mensile di affitto
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "0-300", label: "Fino a 300 EUR" },
              { value: "300-500", label: "300 - 500 EUR" },
              { value: "500-800", label: "500 - 800 EUR" },
              { value: "800-1200", label: "800 - 1.200 EUR" },
              { value: "1200+", label: "Oltre 1.200 EUR" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRentAmountRange(opt.value)}
                className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                  rentAmountRange === opt.value
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

      {housingType === "proprietario" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Hai un mutuo?
          </label>
          <button
            type="button"
            onClick={() => setHasMortgage(!hasMortgage)}
            className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
              hasMortgage
                ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                : "border-border-light hover:border-accent-primary/30"
            }`}
          >
            {hasMortgage ? "Si, ho un mutuo attivo" : "No, nessun mutuo"}
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Hai fatto ristrutturazioni di recente?
        </label>
        <button
          type="button"
          onClick={() => setHasRenovatedRecently(!hasRenovatedRecently)}
          className={`border rounded-sm px-4 py-3 text-sm transition-colors w-full ${
            hasRenovatedRecently
              ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
              : "border-border-light hover:border-accent-primary/30"
          }`}
        >
          {hasRenovatedRecently ? "Si, ho ristrutturato di recente" : "No, nessuna ristrutturazione recente"}
        </button>
      </div>

      {hasRenovatedRecently && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Anno della ristrutturazione
          </label>
          <input
            type="number"
            value={renovationYear}
            onChange={(e) => setRenovationYear(e.target.value)}
            placeholder="es. 2023"
            min="2015"
            max="2026"
            className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Tipo di riscaldamento
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "gas", label: "Gas" },
            { value: "elettrico", label: "Elettrico" },
            { value: "pompa_calore", label: "Pompa di calore" },
            { value: "pellet", label: "Pellet" },
            { value: "altro", label: "Altro" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setHeatingType(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                heatingType === opt.value
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
            housingType: (housingType) || undefined,
            isPrimaryResidence,
            rentAmountRange: housingType === "affitto"
              ? (rentAmountRange) || undefined
              : undefined,
            hasMortgage: housingType === "proprietario" ? hasMortgage : false,
            hasRenovatedRecently,
            renovationYear: hasRenovatedRecently && renovationYear
              ? parseInt(renovationYear)
              : undefined,
            heatingType: (heatingType) || undefined,
          })}
          className="flex-1"
        >
          Continua
        </Button>
      </div>
    </div>
  );
}
