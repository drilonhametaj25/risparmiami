"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2 } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description: string | null;
  month: number;
  year: number;
  amount: number;
  provider: string | null;
}

const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

interface ExpenseTrackerProps {
  initialExpenses: Expense[];
  categories: { value: string; label: string }[];
  title: string;
  showProvider?: boolean;
}

export function ExpenseTracker({ initialExpenses, categories, title, showProvider = true }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(categories[0]?.value || "");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgMonthly = expenses.length > 0
    ? totalAmount / new Set(expenses.map((e) => `${e.year}-${e.month}`)).size
    : 0;

  async function handleAdd() {
    if (!amount) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description || undefined,
          month,
          year,
          amount: parseFloat(amount),
          provider: provider || undefined,
        }),
      });

      if (!res.ok) throw new Error();

      const exp = await res.json();
      setExpenses([exp, ...expenses]);
      setAmount("");
      setDescription("");
      setProvider("");
      setShowForm(false);
      showToast("Spesa aggiunta");
    } catch {
      showToast("Errore nel salvataggio", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setExpenses(expenses.filter((e) => e.id !== id));
      setDeletingId(null);
      showToast("Spesa eliminata");
    } catch {
      showToast("Errore nell'eliminazione", "error");
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary">{title}</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi
        </Button>
      </div>

      {showForm && (
        <Card padding="md">
          <div className="space-y-4">
            {categories.length > 1 && (
              <div>
                <label htmlFor="expense-category" className="block text-sm font-medium text-text-secondary mb-1.5">Tipo</label>
                <select
                  id="expense-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-month" className="block text-sm font-medium text-text-secondary mb-1.5">Mese</label>
                <select
                  id="expense-month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="expense-year" className="block text-sm font-medium text-text-secondary mb-1.5">Anno</label>
                <select
                  id="expense-year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="expense-amount" className="block text-sm font-medium text-text-secondary mb-1.5">Importo (&euro;)</label>
              <input
                id="expense-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="es. 85.50"
                min="0"
                step="0.01"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>

            {showProvider && (
              <div>
                <label htmlFor="expense-provider" className="block text-sm font-medium text-text-secondary mb-1.5">Fornitore (opzionale)</label>
                <input
                  id="expense-provider"
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="es. Enel, Vodafone"
                  className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                />
              </div>
            )}

            <div>
              <label htmlFor="expense-description" className="block text-sm font-medium text-text-secondary mb-1.5">Descrizione (opzionale)</label>
              <input
                id="expense-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="es. Bolletta bimestrale"
                className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Annulla</Button>
              <Button onClick={handleAdd} disabled={!amount || isSubmitting} className="flex-1">
                {isSubmitting ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {expenses.length > 0 ? (
        <>
          <Card padding="md">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Media mensile</span>
              <span className="font-mono font-bold text-text-primary">&euro;{avgMonthly.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-text-secondary">Totale registrato</span>
              <span className="font-mono font-bold text-text-primary">&euro;{totalAmount.toFixed(2)}</span>
            </div>
          </Card>

          <div className="space-y-2">
            {expenses.map((exp) => (
              <Card key={exp.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {categories.find((c) => c.value === exp.category)?.label || exp.category}
                      {exp.provider ? ` — ${exp.provider}` : ""}
                    </p>
                    <p className="text-xs text-text-muted">
                      {MONTHS[exp.month - 1]} {exp.year}
                      {exp.description ? ` · ${exp.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-text-primary">&euro;{exp.amount.toFixed(2)}</span>
                    {deletingId === exp.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(exp.id)}
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
                        onClick={() => setDeletingId(exp.id)}
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
            Nessuna spesa registrata. Aggiungi le tue spese per ricevere suggerimenti personalizzati.
          </p>
        </Card>
      )}
    </div>
  );
}
