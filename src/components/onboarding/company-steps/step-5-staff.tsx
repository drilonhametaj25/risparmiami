"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function CompanyStepStaff({ data, onNext, onBack, isPending }: StepProps) {
  const [offersWelfare, setOffersWelfare] = useState(data.offersWelfare ?? false);
  const [hasApprentices, setHasApprentices] = useState(data.hasApprentices ?? false);
  const [hiredRecently, setHiredRecently] = useState(data.hiredRecently ?? false);
  const [hiredYouth, setHiredYouth] = useState(data.hiredYouth ?? false);
  const [hiredWomen, setHiredWomen] = useState(data.hiredWomen ?? false);
  const [hiredDisadvantaged, setHiredDisadvantaged] = useState(data.hiredDisadvantaged ?? false);

  const toggles = [
    { label: "Offri welfare aziendale?", value: offersWelfare, setter: setOffersWelfare },
    { label: "Hai apprendisti?", value: hasApprentices, setter: setHasApprentices },
    { label: "Hai assunto personale di recente (ultimi 12 mesi)?", value: hiredRecently, setter: setHiredRecently },
    { label: "Hai assunto giovani under 36?", value: hiredYouth, setter: setHiredYouth },
    { label: "Hai assunto donne?", value: hiredWomen, setter: setHiredWomen },
    { label: "Hai assunto categorie svantaggiate?", value: hiredDisadvantaged, setter: setHiredDisadvantaged },
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

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Indietro</Button>
        <Button
          onClick={() => onNext({
            offersWelfare,
            hasApprentices,
            hiredRecently,
            hiredYouth,
            hiredWomen,
            hiredDisadvantaged,
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
