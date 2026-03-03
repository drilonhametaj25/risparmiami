"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


const REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia",
  "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
];

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function StepAboutYou({ data, onNext }: StepProps) {
  const [birthYear, setBirthYear] = useState(data.birthYear?.toString() || "");
  const [region, setRegion] = useState(data.region || "");
  const [maritalStatus, setMaritalStatus] = useState(data.maritalStatus || "");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Anno di nascita</label>
        <input
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="es. 1990"
          min="1940"
          max="2010"
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Regione</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        >
          <option value="">Seleziona la tua regione</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Stato civile</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "single", label: "Single" },
            { value: "married", label: "Sposato/a" },
            { value: "divorced", label: "Divorziato/a" },
            { value: "widowed", label: "Vedovo/a" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMaritalStatus(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                maritalStatus === opt.value
                  ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                  : "border-border-light hover:border-accent-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onNext({
          birthYear: birthYear ? parseInt(birthYear) : undefined,
          region: region || undefined,
          maritalStatus: (maritalStatus) || undefined,
        })}
        className="w-full"
        disabled={!region}
      >
        Continua
      </Button>
    </div>
  );
}
