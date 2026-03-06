"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, FileText, Calendar, CheckCircle2, Lock } from "lucide-react";

type ActionStatus = "all" | "pending" | "completed" | "not_applicable";

interface Action {
  id: string;
  ruleId: string;
  status: string;
  estimatedSaving: number;
  certainty: string;
  completedAt: string | null;
  locked?: boolean;
  rule: {
    name: string;
    shortDescription: string;
    fullDescription: string | null;
    category: string;
    howToClaim: string | null;
    requiredDocs: string[];
    whereToApply: string | null;
    deadline: string | null;
    officialUrl: string | null;
  };
}

interface ActionsListProps {
  actions: Action[];
}

export function ActionsList({ actions }: ActionsListProps) {
  const [filter, setFilter] = useState<ActionStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [savingsInput, setSavingsInput] = useState("");

  const filtered = filter === "all"
    ? actions
    : actions.filter((a) => a.status === filter);

  const pendingCount = actions.filter((a) => a.status === "pending").length;
  const completedCount = actions.filter((a) => a.status === "completed").length;
  const totalSavings = actions.reduce((s, a) => s + a.estimatedSaving, 0);
  const completedSavings = actions
    .filter((a) => a.status === "completed")
    .reduce((s, a) => s + a.estimatedSaving, 0);

  const tabs: { label: string; value: ActionStatus; count: number }[] = [
    { label: "Tutte", value: "all", count: actions.length },
    { label: "Da fare", value: "pending", count: pendingCount },
    { label: "Completate", value: "completed", count: completedCount },
  ];

  async function markComplete(matchId: string, actualSaving?: number) {
    await fetch(`/api/matches/${matchId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(actualSaving !== undefined ? { actualSaving } : {}) }),
    });
    setCompletingId(null);
    setSavingsInput("");
    window.location.reload();
  }

  return (
    <div>
      {/* Progress bar */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">
            {completedCount} di {actions.length} azioni completate
          </span>
          <span className="font-money font-medium">
            €{completedSavings.toLocaleString("it-IT")} / €{totalSavings.toLocaleString("it-IT")}
          </span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2">
          <div
            className="bg-accent-success h-2 rounded-full transition-all"
            style={{ width: `${actions.length > 0 ? (completedCount / actions.length) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filter === tab.value
                ? "bg-accent-primary text-white"
                : "bg-bg-secondary text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-text-secondary text-sm py-8 text-center">
            Nessuna azione in questa categoria.
          </p>
        ) : (
          filtered.map((action) => (
            <Card key={action.id} padding="md">
              <button
                onClick={() => setExpandedId(expandedId === action.id ? null : action.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {action.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-accent-success" />
                      )}
                      <Badge variant={action.certainty as "certo" | "probabile" | "consiglio"} className="text-xs">
                        {action.certainty}
                      </Badge>
                      <span className="text-xs text-text-muted capitalize">{action.rule.category}</span>
                    </div>
                    <p className="font-medium truncate">{action.rule.name}</p>
                    <p className="text-sm text-text-secondary truncate">{action.rule.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <p className="font-money font-bold text-accent-success whitespace-nowrap">
                      +€{action.estimatedSaving.toLocaleString("it-IT")}
                    </p>
                    <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${expandedId === action.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === action.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-border-light">
                      {action.locked ? (
                        <div className="relative">
                          <div className="filter blur-sm select-none pointer-events-none">
                            <p className="text-sm text-text-secondary">Scopri come richiedere questo beneficio e quanto potresti risparmiare con istruzioni dettagliate passo-passo...</p>
                            <div className="bg-bg-secondary rounded-sm p-4 mt-3">
                              <p className="text-sm">Come richiederlo: istruzioni dettagliate disponibili...</p>
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-md">
                            <div className="text-center p-4">
                              <Lock className="h-6 w-6 text-accent-primary mx-auto mb-2" />
                              <p className="font-medium text-sm mb-2">Sblocca le istruzioni</p>
                              <p className="text-xs text-text-secondary mb-3">Passa al piano Personale per vedere come richiedere questo beneficio</p>
                              <Button size="sm" asChild>
                                <a href="/prezzi">Prova gratis 7 giorni</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-sm max-w-none text-text-secondary mb-4">
                            <p>{action.rule.fullDescription}</p>
                          </div>

                          <div className="bg-bg-secondary rounded-sm p-4 mb-4">
                            <h4 className="font-medium text-sm mb-2">Come richiederlo</h4>
                            <p className="text-sm text-text-secondary">{action.rule.howToClaim}</p>
                          </div>

                          {action.rule.requiredDocs.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                <FileText className="h-4 w-4" /> Documenti necessari
                              </h4>
                              <ul className="text-sm text-text-secondary space-y-1">
                                {action.rule.requiredDocs.map((doc, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {action.rule.deadline && (
                            <p className="text-sm text-accent-warning flex items-center gap-1 mb-4">
                              <Calendar className="h-4 w-4" />
                              Scadenza: {new Date(action.rule.deadline).toLocaleDateString("it-IT")}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3">
                            {action.status === "pending" && !action.locked && (
                              completingId === action.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-text-secondary">&euro;</span>
                                    <input
                                      type="number"
                                      value={savingsInput}
                                      onChange={(e) => setSavingsInput(e.target.value)}
                                      placeholder={String(action.estimatedSaving)}
                                      className="w-24 px-2 py-1 text-sm border border-border-light rounded"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                  <Button size="sm" onClick={() => markComplete(action.id, savingsInput ? Number(savingsInput) : undefined)}>
                                    Conferma
                                  </Button>
                                  <Button size="sm" variant="secondary" onClick={() => markComplete(action.id)}>
                                    Salta
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" onClick={() => { setCompletingId(action.id); setSavingsInput(String(action.estimatedSaving)); }}>
                                  Segna come completata
                                </Button>
                              )
                            )}
                            {action.rule.officialUrl && (
                              <Button size="sm" variant="secondary" asChild>
                                <a href={action.rule.officialUrl} target="_blank" rel="noopener noreferrer">
                                  Sito ufficiale <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
