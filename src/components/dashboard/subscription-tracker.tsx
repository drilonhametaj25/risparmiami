"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2 } from "lucide-react";

interface Subscription {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  isActive: boolean;
}

const CATEGORIES = [
  { value: "streaming", label: "Streaming" },
  { value: "music", label: "Musica" },
  { value: "news", label: "News" },
  { value: "fitness", label: "Fitness" },
  { value: "cloud", label: "Cloud" },
  { value: "gaming", label: "Gaming" },
  { value: "other", label: "Altro" },
];

interface SubscriptionTrackerProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionTracker({ initialSubscriptions }: SubscriptionTrackerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("streaming");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const totalMonthly = subscriptions.filter((s) => s.isActive).reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalYearly = totalMonthly * 12;

  async function handleAdd() {
    if (!name || !monthlyCost) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, monthlyCost: parseFloat(monthlyCost) }),
      });

      if (!res.ok) throw new Error();

      const sub = await res.json();
      setSubscriptions([sub, ...subscriptions]);
      setName("");
      setMonthlyCost("");
      setShowForm(false);
      showToast("Abbonamento aggiunto");
    } catch {
      showToast("Errore nel salvataggio", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSubscriptions(subscriptions.filter((s) => s.id !== id));
      setDeletingId(null);
      showToast("Abbonamento eliminato");
    } catch {
      showToast("Errore nell'eliminazione", "error");
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary">I tuoi abbonamenti</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi
        </Button>
      </div>

      {showForm && (
        <Card padding="md">
          <div className="space-y-4">
            <div>
              <label htmlFor="sub-name" className="block text-sm font-medium text-text-secondary mb-1.5">Nome servizio</label>
              <input
                id="sub-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Netflix, Spotify, Amazon Prime"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>

            <div>
              <label htmlFor="sub-category" className="block text-sm font-medium text-text-secondary mb-1.5">Categoria</label>
              <select
                id="sub-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sub-cost" className="block text-sm font-medium text-text-secondary mb-1.5">Costo mensile</label>
              <input
                id="sub-cost"
                type="number"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
                placeholder="es. 12.99"
                min="0"
                step="0.01"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Annulla</Button>
              <Button onClick={handleAdd} disabled={!name || !monthlyCost || isSubmitting} className="flex-1">
                {isSubmitting ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {subscriptions.length > 0 ? (
        <>
          <Card padding="md">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Totale mensile</span>
              <span className="font-mono font-bold text-text-primary">&euro;{totalMonthly.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-text-secondary">Totale annuo</span>
              <span className="font-mono font-bold text-text-primary">&euro;{totalYearly.toFixed(2)}</span>
            </div>
          </Card>

          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <Card key={sub.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{sub.name}</p>
                    <p className="text-xs text-text-muted">
                      {CATEGORIES.find((c) => c.value === sub.category)?.label || sub.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-text-primary">&euro;{sub.monthlyCost.toFixed(2)}/mese</span>
                    {deletingId === sub.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-xs text-accent-danger font-medium hover:underline"
                        >
                          Conferma
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs text-text-muted hover:underline"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(sub.id)}
                        className="text-text-muted hover:text-accent-danger transition-colors"
                        aria-label="Elimina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card padding="md">
          <p className="text-sm text-text-muted text-center py-4">
            Nessun abbonamento inserito. Aggiungi i tuoi abbonamenti per ricevere suggerimenti personalizzati.
          </p>
        </Card>
      )}
    </div>
  );
}
