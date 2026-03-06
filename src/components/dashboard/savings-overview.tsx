"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, Target, Share2, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface SavingsOverviewProps {
  totalSavings: number;
  completedSavings: number;
  actualSavings: number;
  matchCount: number;
}

export function SavingsOverview({ totalSavings, completedSavings, actualSavings, matchCount }: SavingsOverviewProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const progress = totalSavings > 0 ? (completedSavings / totalSavings) * 100 : 0;

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValue(Math.round(totalSavings * eased));
      if (p < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [totalSavings]);

  async function handleShare() {
    if (sharing) return;
    setSharing(true);

    try {
      const res = await fetch("/api/share", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        console.error("Share error:", data.error);
        setSharing(false);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "I miei risparmi — RisparmiaMi",
          text: `Ho scoperto €${totalSavings.toLocaleString("it-IT")} di risparmi potenziali!`,
          url: data.url,
        }).catch(() => {});
      } else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(false);
    }
  }

  return (
    <Card padding="lg" className="bg-gradient-to-br from-accent-primary to-accent-primary/80 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-white/70 text-sm mb-1">Risparmio potenziale totale</p>
          <p className="font-money text-4xl md:text-5xl font-bold">
            €{displayValue.toLocaleString("it-IT")}
          </p>
          <p className="text-white/70 text-sm mt-2">
            {matchCount} opportunità trovate
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <Target className="h-5 w-5" />
            </div>
            <p className="font-money text-lg font-bold">€{(actualSavings > 0 ? actualSavings : completedSavings).toLocaleString("it-IT")}</p>
            <p className="text-xs text-white/70">{actualSavings > 0 ? "Risparmiato" : "Recuperato"}</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="font-money text-lg font-bold">{Math.round(progress)}%</p>
            <p className="text-xs text-white/70">Progresso</p>
          </div>
          <div className="text-center">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center mb-1 transition-colors duration-200 disabled:opacity-50"
              title="Condividi i tuoi risparmi"
            >
              {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            </button>
            <p className="text-xs text-white/70">{copied ? "Copiato!" : "Condividi"}</p>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-4 w-full bg-white/20 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      {actualSavings >= 100 && actualSavings < 500 && (
        <p className="text-xs text-white/80 mt-2">Primo traguardo raggiunto: 100 euro!</p>
      )}
      {actualSavings >= 500 && actualSavings < 1000 && (
        <p className="text-xs text-white/80 mt-2">Grande risultato: oltre 500 euro risparmiati!</p>
      )}
      {actualSavings >= 1000 && (
        <p className="text-xs text-white/80 mt-2">Incredibile: oltre 1.000 euro risparmiati!</p>
      )}
    </Card>
  );
}
