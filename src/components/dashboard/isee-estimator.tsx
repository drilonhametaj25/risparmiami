"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Save, RefreshCw, AlertTriangle } from "lucide-react";

const ISEE_RANGES = [
  { max: 9530, label: "Fino a \u20ac9.530", value: "under_9530" },
  { max: 15000, label: "Fino a \u20ac15.000", value: "under_15000" },
  { max: 25000, label: "Fino a \u20ac25.000", value: "under_25000" },
  { max: 40000, label: "Fino a \u20ac40.000", value: "under_40000" },
  { max: Infinity, label: "Oltre \u20ac40.000", value: "over_40000" },
];

const ISEE_BENEFITS: Record<string, string[]> = {
  under_9530: [
    "Reddito di Inclusione / Assegno di Inclusione",
    "Bonus sociale luce e gas (massimo sconto)",
    "Bonus acqua",
    "Assegno unico maggiorato",
    "Esenzione ticket sanitario",
    "Contributo affitto comunale",
    "Riduzione tasse universitarie",
    "Carta acquisti / Carta Dedicata a te",
  ],
  under_15000: [
    "Bonus sociale luce e gas (sconto ridotto)",
    "Bonus acqua",
    "Assegno unico con maggiorazione parziale",
    "Riduzione tasse universitarie",
    "Contributo affitto (dove previsto)",
    "Agevolazioni mensa scolastica",
  ],
  under_25000: [
    "Assegno unico base",
    "Riduzione parziale tasse universitarie",
    "Agevolazioni mensa scolastica",
    "Bonus asilo nido (importo ridotto)",
  ],
  under_40000: [
    "Assegno unico base",
    "Bonus asilo nido (importo minimo)",
    "Detrazioni fiscali standard",
  ],
  over_40000: [
    "Assegno unico base (importo minimo)",
    "Detrazioni fiscali standard",
  ],
};

interface IseeEstimatorProps {
  initialIseeRange: string;
}

export function IseeEstimator({ initialIseeRange }: IseeEstimatorProps) {
  const [redditoFamiliare, setRedditoFamiliare] = useState("");
  const [componenti, setComponenti] = useState("1");
  const [patrimonioImmobiliare, setPatrimonioImmobiliare] = useState("");
  const [patrimonioMobiliare, setPatrimonioMobiliare] = useState("");
  const [inAffitto, setInAffitto] = useState(false);
  const [affittoAnnuo, setAffittoAnnuo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [currentIseeRange, setCurrentIseeRange] = useState(initialIseeRange);

  const reddito = parseFloat(redditoFamiliare) || 0;
  const numComponenti = parseInt(componenti) || 1;
  const immobiliare = parseFloat(patrimonioImmobiliare) || 0;
  const mobiliare = parseFloat(patrimonioMobiliare) || 0;
  const affitto = inAffitto ? (parseFloat(affittoAnnuo) || 0) : 0;

  const result = useMemo(() => {
    if (reddito === 0 && immobiliare === 0 && mobiliare === 0) {
      return null;
    }

    // Simplified ISEE calculation
    // ISE = reddito + 20% patrimonio mobiliare + 20% patrimonio immobiliare
    const ise = reddito + (mobiliare * 0.20) + (immobiliare * 0.20);

    // Scala di equivalenza (simplified version of the official scale)
    // Base: 1 componente = 1.00
    // Each additional member: +0.35
    // Additional adjustments for specific situations
    let scalaEquivalenza = 1.0;
    if (numComponenti >= 2) scalaEquivalenza += 0.57; // 2 components
    if (numComponenti >= 3) scalaEquivalenza += 0.47; // 3 components
    if (numComponenti >= 4) scalaEquivalenza += 0.42; // 4 components
    if (numComponenti >= 5) scalaEquivalenza += 0.39; // 5 components
    if (numComponenti > 5) scalaEquivalenza += (numComponenti - 5) * 0.35; // 6+

    // Rent deduction (simplified)
    const redditoNetto = inAffitto ? Math.max(0, reddito - Math.min(affitto, 7000)) : reddito;
    const iseNetto = redditoNetto + (mobiliare * 0.20) + (immobiliare * 0.20);

    const iseeApprox = iseNetto / scalaEquivalenza;

    // Determine ISEE range
    const range = ISEE_RANGES.find((r) => iseeApprox <= r.max) || ISEE_RANGES[ISEE_RANGES.length - 1];

    return {
      ise,
      scalaEquivalenza,
      iseeApprox,
      range,
      benefits: ISEE_BENEFITS[range.value] || [],
    };
  }, [reddito, numComponenti, immobiliare, mobiliare, inAffitto, affitto]);

  async function handleSave() {
    if (!result) return;

    setIsSubmitting(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iseeRange: result.range.value,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore nell'aggiornamento del profilo");
      }

      // Trigger rule re-matching (already done by the profile PATCH, but explicit for clarity)
      await fetch("/api/rules/match", { method: "POST" });

      setCurrentIseeRange(result.range.value);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentRangeLabel = ISEE_RANGES.find((r) => r.value === currentIseeRange)?.label;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-accent-primary" />
        <h3 className="font-medium text-text-primary">Stima il tuo ISEE</h3>
      </div>

      {currentIseeRange && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Fascia ISEE attuale nel profilo:</span>
            <span className="text-sm font-medium text-text-primary">{currentRangeLabel || currentIseeRange}</span>
          </div>
        </Card>
      )}

      <Card padding="md">
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Stima indicativa &mdash; per il calcolo ufficiale rivolgiti al CAF o consulta il sito INPS.
              Il valore reale dipende da molti fattori non considerati in questa stima semplificata.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Reddito familiare lordo annuo (&euro;)
            </label>
            <input
              type="number"
              value={redditoFamiliare}
              onChange={(e) => setRedditoFamiliare(e.target.value)}
              placeholder="es. 25000"
              min="0"
              step="100"
              className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Numero componenti nucleo familiare
            </label>
            <select
              value={componenti}
              onChange={(e) => setComponenti(e.target.value)}
              className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "componente" : "componenti"}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Patrimonio immobiliare (&euro;)
              </label>
              <input
                type="number"
                value={patrimonioImmobiliare}
                onChange={(e) => setPatrimonioImmobiliare(e.target.value)}
                placeholder="es. 150000"
                min="0"
                step="1000"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
              <p className="text-xs text-text-muted mt-1">Valore catastale degli immobili di propriet&agrave;</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Patrimonio mobiliare (&euro;)
              </label>
              <input
                type="number"
                value={patrimonioMobiliare}
                onChange={(e) => setPatrimonioMobiliare(e.target.value)}
                placeholder="es. 10000"
                min="0"
                step="100"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
              <p className="text-xs text-text-muted mt-1">Conti correnti, depositi, investimenti</p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inAffitto}
                onChange={(e) => setInAffitto(e.target.checked)}
                className="rounded border-border-light text-accent-primary focus:ring-accent-primary/20"
              />
              <span className="text-sm font-medium text-text-secondary">In affitto?</span>
            </label>
          </div>

          {inAffitto && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Affitto annuo (&euro;/anno)
              </label>
              <input
                type="number"
                value={affittoAnnuo}
                onChange={(e) => setAffittoAnnuo(e.target.value)}
                placeholder="es. 7200"
                min="0"
                step="100"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
              <p className="text-xs text-text-muted mt-1">Detrazione max &euro;7.000 per nuclei in locazione</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="border-t border-border-light pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary rounded-sm p-4">
                  <p className="text-xs text-text-muted mb-1">ISEE stimato</p>
                  <p className="font-mono text-lg font-bold text-text-primary">
                    &euro;{result.iseeApprox.toLocaleString("it-IT", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-bg-secondary rounded-sm p-4">
                  <p className="text-xs text-text-muted mb-1">Fascia ISEE</p>
                  <p className="font-mono text-lg font-bold text-accent-primary">
                    {result.range.label}
                  </p>
                </div>
              </div>

              <div className="text-xs text-text-muted">
                <p>Scala di equivalenza applicata: {result.scalaEquivalenza.toFixed(2)}</p>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  Potenziali agevolazioni per la tua fascia:
                </h4>
                <ul className="space-y-1.5">
                  {result.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-accent-success mt-0.5">&bull;</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-accent-danger">{error}</p>
          )}

          {saved && (
            <p className="text-sm text-accent-success">
              Fascia ISEE aggiornata! I suggerimenti sono stati ricalcolati.
            </p>
          )}

          <Button
            onClick={handleSave}
            disabled={isSubmitting || !result}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salva fascia ISEE e aggiorna suggerimenti
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
