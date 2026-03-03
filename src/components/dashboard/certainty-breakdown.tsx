"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, HelpCircle, Lightbulb } from "lucide-react";

interface CertaintyData {
  count: number;
  total: number;
}

interface CertaintyBreakdownProps {
  certo: CertaintyData;
  probabile: CertaintyData;
  consiglio: CertaintyData;
}

export function CertaintyBreakdown({ certo, probabile, consiglio }: CertaintyBreakdownProps) {
  const items = [
    { label: "Certi", data: certo, variant: "certo" as const, icon: ShieldCheck, color: "text-accent-success" },
    { label: "Probabili", data: probabile, variant: "probabile" as const, icon: HelpCircle, color: "text-accent-warning" },
    { label: "Consigli", data: consiglio, variant: "consiglio" as const, icon: Lightbulb, color: "text-text-muted" },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label} padding="md">
          <div className="flex items-center justify-between mb-3">
            <Badge variant={item.variant}>{item.label}</Badge>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <p className="font-money text-2xl font-bold">
            €{item.data.total.toLocaleString("it-IT")}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {item.data.count} {item.data.count === 1 ? "opportunità" : "opportunità"}
          </p>
        </Card>
      ))}
    </div>
  );
}
