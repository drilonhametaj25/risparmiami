"use client";

import { Card } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  detrazioni: "Detrazioni fiscali",
  bollette: "Bollette",
  banca: "Banca",
  abbonamenti: "Abbonamenti",
  trasporti: "Trasporti",
  isee: "ISEE e bonus",
  incentivi: "Incentivi imprese",
};

const categoryColors: Record<string, string> = {
  detrazioni: "bg-accent-primary",
  bollette: "bg-amber-500",
  banca: "bg-emerald-500",
  abbonamenti: "bg-purple-500",
  trasporti: "bg-sky-500",
  isee: "bg-rose-500",
  incentivi: "bg-indigo-500",
};

interface CategoryChartProps {
  categories: Record<string, number>;
}

export function CategoryChart({ categories }: CategoryChartProps) {
  const entries = Object.entries(categories).sort(([, a], [, b]) => b - a);
  const maxValue = entries.length > 0 ? entries[0][1] : 0;

  if (entries.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="font-heading text-lg mb-2">Risparmio per categoria</h3>
        <p className="text-text-secondary text-sm">
          Completa il profilo per vedere i risparmi per categoria.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h3 className="font-heading text-lg mb-4">Risparmio per categoria</h3>
      <div className="space-y-3">
        {entries.map(([cat, amount]) => {
          const width = maxValue > 0 ? (amount / maxValue) * 100 : 0;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">{categoryLabels[cat] || cat}</span>
                <span className="font-money font-medium">€{amount.toLocaleString("it-IT")}</span>
              </div>
              <div className="w-full bg-bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${categoryColors[cat] || "bg-gray-400"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
