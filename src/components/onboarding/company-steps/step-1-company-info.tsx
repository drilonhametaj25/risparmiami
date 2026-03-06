"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia",
  "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
];

const LEGAL_FORMS = [
  { value: "srl", label: "SRL" },
  { value: "spa", label: "SPA" },
  { value: "sas", label: "SAS" },
  { value: "snc", label: "SNC" },
  { value: "ditta_individuale", label: "Ditta individuale" },
  { value: "cooperativa", label: "Cooperativa" },
  { value: "altro", label: "Altro" },
];

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function CompanyStepInfo({ data, onNext }: StepProps) {
  const [companyName, setCompanyName] = useState(data.companyName || "");
  const [legalForm, setLegalForm] = useState(data.legalForm || "");
  const [atecoCode, setAtecoCode] = useState(data.atecoCode || "");
  const [region, setRegion] = useState(data.region || "");
  const [foundedYear, setFoundedYear] = useState(data.foundedYear?.toString() || "");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome azienda</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="es. Rossi S.r.l."
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Forma giuridica</label>
        <div className="grid grid-cols-2 gap-3">
          {LEGAL_FORMS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLegalForm(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                legalForm === opt.value
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
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Codice ATECO (opzionale)</label>
        <input
          type="text"
          value={atecoCode}
          onChange={(e) => setAtecoCode(e.target.value)}
          placeholder="es. 62.01"
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Regione sede legale</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        >
          <option value="">Seleziona la regione</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Anno di fondazione</label>
        <input
          type="number"
          value={foundedYear}
          onChange={(e) => setFoundedYear(e.target.value)}
          placeholder="es. 2015"
          min="1900"
          max="2026"
          className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
        />
      </div>

      <Button
        onClick={() => onNext({
          companyName: companyName || undefined,
          legalForm: legalForm || undefined,
          atecoCode: atecoCode || undefined,
          region: region || undefined,
          foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
        })}
        className="w-full"
        disabled={!companyName || !region}
      >
        Continua
      </Button>
    </div>
  );
}
