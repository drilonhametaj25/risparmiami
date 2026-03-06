"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

const EMPLOYEE_RANGES = [
  { value: "1-5", label: "1-5" },
  { value: "6-15", label: "6-15" },
  { value: "16-50", label: "16-50" },
  { value: "51-250", label: "51-250" },
  { value: "250+", label: "250+" },
];

const REVENUE_RANGES = [
  { value: "0-100k", label: "Fino a 100K" },
  { value: "100k-500k", label: "100K - 500K" },
  { value: "500k-2M", label: "500K - 2M" },
  { value: "2M-10M", label: "2M - 10M" },
  { value: "10M+", label: "Oltre 10M" },
];

export function CompanyStepSize({ data, onNext, onBack }: StepProps) {
  const [employeeCount, setEmployeeCount] = useState(data.employeeCount || "");
  const [revenueRange, setRevenueRange] = useState(data.revenueRange || "");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Numero dipendenti</label>
        <div className="grid grid-cols-3 gap-3">
          {EMPLOYEE_RANGES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEmployeeCount(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                employeeCount === opt.value
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
        <label className="block text-sm font-medium text-text-secondary mb-3">Fatturato annuo</label>
        <div className="grid grid-cols-2 gap-3">
          {REVENUE_RANGES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRevenueRange(opt.value)}
              className={`border rounded-sm px-4 py-3 text-sm transition-colors ${
                revenueRange === opt.value
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
        <Button onClick={() => onNext({ employeeCount: employeeCount || undefined, revenueRange: revenueRange || undefined })} className="flex-1">Continua</Button>
      </div>
    </div>
  );
}
