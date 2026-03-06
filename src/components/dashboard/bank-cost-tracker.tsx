"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, Save, RefreshCw } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "corrente", label: "Conto corrente" },
  { value: "deposito", label: "Conto deposito" },
  { value: "conto_zero", label: "Conto zero spese" },
];

interface BankCostTrackerProps {
  initialData: {
    bankName: string;
    accountType: string;
    canoneAnnuo: number;
    commissioniMedie: number;
    impostaBollo: number;
    costoCarta: number;
  };
}

export function BankCostTracker({ initialData }: BankCostTrackerProps) {
  const [bankName, setBankName] = useState(initialData.bankName);
  const [accountType, setAccountType] = useState(initialData.accountType || "corrente");
  const [canoneAnnuo, setCanoneAnnuo] = useState(initialData.canoneAnnuo.toString() || "");
  const [commissioniMedie, setCommissioniMedie] = useState(initialData.commissioniMedie.toString() || "");
  const [impostaBollo, setImpostaBollo] = useState(initialData.impostaBollo.toString() || "34.20");
  const [costoCarta, setCostoCarta] = useState(initialData.costoCarta.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const canone = parseFloat(canoneAnnuo) || 0;
  const commissioni = parseFloat(commissioniMedie) || 0;
  const bollo = parseFloat(impostaBollo) || 0;
  const carta = parseFloat(costoCarta) || 0;

  const costoTotaleAnnuo = canone + (commissioni * 12) + bollo + carta;
  const costoTotaleMensile = costoTotaleAnnuo / 12;

  async function handleSave() {
    setIsSubmitting(true);
    setError("");
    setSaved(false);

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Save each cost component as an expense entry
      const costComponents = [
        { category: "bank_canone", amount: canone, description: "Canone annuo conto" },
        { category: "bank_commissioni", amount: commissioni * 12, description: "Commissioni annue stimate" },
        { category: "bank_bollo", amount: bollo, description: "Imposta di bollo" },
        { category: "bank_carta", amount: carta, description: "Costo carta annuo" },
      ];

      for (const component of costComponents) {
        if (component.amount > 0) {
          await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...component,
              month,
              year,
              provider: bankName || undefined,
            }),
          });
        }
      }

      // Determine the estimated cost range for the profile
      const estimatedBankCost = costoTotaleAnnuo <= 50
        ? "0-50"
        : costoTotaleAnnuo <= 100
        ? "50-100"
        : costoTotaleAnnuo <= 200
        ? "100-200"
        : "200+";

      // Update user profile
      const profileRes = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: bankName || undefined,
          accountType: accountType || undefined,
          estimatedBankCost,
        }),
      });

      if (!profileRes.ok) {
        throw new Error("Errore nell'aggiornamento del profilo");
      }

      // Trigger rule re-matching
      await fetch("/api/rules/match", { method: "POST" });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-accent-primary" />
        <h3 className="font-medium text-text-primary">I tuoi costi bancari</h3>
      </div>

      <Card padding="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Banca</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="es. Intesa Sanpaolo, UniCredit"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipo conto</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Canone annuo (&euro;/anno)
              </label>
              <input
                type="number"
                value={canoneAnnuo}
                onChange={(e) => setCanoneAnnuo(e.target.value)}
                placeholder="es. 60.00"
                min="0"
                step="0.01"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Commissioni medie (&euro;/mese)
              </label>
              <input
                type="number"
                value={commissioniMedie}
                onChange={(e) => setCommissioniMedie(e.target.value)}
                placeholder="es. 5.00"
                min="0"
                step="0.01"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Imposta di bollo (&euro;/anno)
              </label>
              <input
                type="number"
                value={impostaBollo}
                onChange={(e) => setImpostaBollo(e.target.value)}
                placeholder="34.20"
                min="0"
                step="0.01"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                Default: &euro;34,20/anno per giacenze medie &gt; &euro;5.000
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Costo carta (&euro;/anno)
              </label>
              <input
                type="number"
                value={costoCarta}
                onChange={(e) => setCostoCarta(e.target.value)}
                placeholder="es. 20.00"
                min="0"
                step="0.01"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-border-light pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-secondary rounded-sm p-4">
                <p className="text-xs text-text-muted mb-1">Costo totale annuo</p>
                <p className="font-mono text-lg font-bold text-text-primary">
                  &euro;{costoTotaleAnnuo.toFixed(2)}
                </p>
              </div>
              <div className="bg-bg-secondary rounded-sm p-4">
                <p className="text-xs text-text-muted mb-1">Costo totale mensile</p>
                <p className="font-mono text-lg font-bold text-text-primary">
                  &euro;{costoTotaleMensile.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-accent-danger">{error}</p>
          )}

          {saved && (
            <p className="text-sm text-accent-success">Dati salvati con successo! I suggerimenti sono stati aggiornati.</p>
          )}

          <Button onClick={handleSave} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salva e aggiorna suggerimenti
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
