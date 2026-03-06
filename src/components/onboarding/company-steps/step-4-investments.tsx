"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

const ENERGY_RANGES = [
  { value: "0-500", label: "Fino a 500\u20AC" },
  { value: "500-2000", label: "500 - 2.000\u20AC" },
  { value: "2000-5000", label: "2.000 - 5.000\u20AC" },
  { value: "5000-15000", label: "5.000 - 15.000\u20AC" },
  { value: "15000+", label: "Oltre 15.000\u20AC" },
];

export function CompanyStepInvestments({ data, onNext, onBack }: StepProps) {
  const [investsInTraining, setInvestsInTraining] = useState(data.investsInTraining ?? false);
  const [investsInRD, setInvestsInRD] = useState(data.investsInRD ?? false);
  const [boughtEquipmentRecently, setBoughtEquipmentRecently] = useState(data.boughtEquipmentRecently ?? false);
  const [energyCostRange, setEnergyCostRange] = useState(data.energyCostRange || "");
  const [hasCompanyVehicles, setHasCompanyVehicles] = useState(data.hasCompanyVehicles ?? false);

  const toggles = [
    { label: "Investi in formazione del personale?", value: investsInTraining, setter: setInvestsInTraining },
    { label: "Investi in Ricerca e Sviluppo?", value: investsInRD, setter: setInvestsInRD },
    { label: "Hai acquistato macchinari/attrezzature di recente?", value: boughtEquipmentRecently, setter: setBoughtEquipmentRecently },
    { label: "Hai veicoli aziendali?", value: hasCompanyVehicles, setter: setHasCompanyVehicles },
  ];

  return (
    <div className="space-y-6">
      {toggles.map((t) => (
        <div key={t.label}>
          <label className="block text-sm font-medium text-text-secondary mb-3">{t.label}</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: true, l: "Si" }, { v: false, l: "No" }].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => t.setter(opt.v)}
                className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                  t.value === opt.v
                    ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                    : "border-border-light hover:border-accent-primary/30"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Costo energia mensile</label>
        <div className="grid grid-cols-2 gap-3">
          {ENERGY_RANGES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEnergyCostRange(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                energyCostRange === opt.value
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
        <Button onClick={() => onNext({
          investsInTraining,
          investsInRD,
          boughtEquipmentRecently,
          energyCostRange: energyCostRange || undefined,
          hasCompanyVehicles,
        })} className="flex-1">Continua</Button>
      </div>
    </div>
  );
}
