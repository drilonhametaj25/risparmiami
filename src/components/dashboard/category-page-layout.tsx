"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RuleMatch {
  id: string;
  status: string;
  estimatedSaving: number;
  certainty: string;
  rule: {
    name: string;
    shortDescription: string;
    fullDescription: string;
    howToClaim: string;
    requiredDocs: string[];
    whereToApply: string | null;
    officialUrl: string | null;
    deadline: string | null;
  };
}

interface CategoryPageLayoutProps {
  title: string;
  description: string;
  matches: RuleMatch[];
  totalSavings: number;
  children?: React.ReactNode;
}

export function CategoryPageLayout({
  title,
  description,
  matches,
  totalSavings,
  children,
}: CategoryPageLayoutProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl mb-1">{title}</h1>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>

      {/* Summary card */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Risparmio potenziale</p>
            <p className="font-money text-2xl font-bold text-accent-success">
              &euro;{totalSavings.toLocaleString("it-IT")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">{matches.length} opportunit&agrave;</p>
            <p className="text-sm text-text-muted">
              {matches.filter(m => m.status === "completed").length} completate
            </p>
          </div>
        </div>
      </Card>

      {/* Extra content (data trackers, banners) */}
      {children && <div className="mb-6">{children}</div>}

      {/* Matches list */}
      <h3 className="font-medium text-text-primary mb-3">Suggerimenti</h3>
      <div className="space-y-3">
        {matches.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-text-secondary">Nessuna opportunit&agrave; trovata in questa categoria.</p>
            <p className="text-sm text-text-muted mt-1">Completa il tuo profilo per ottenere risultati migliori.</p>
          </Card>
        ) : (
          matches.map((match) => (
            <Card key={match.id} padding="md">
              <button
                onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={match.certainty as "certo" | "probabile" | "consiglio"} className="text-xs">
                        {match.certainty}
                      </Badge>
                    </div>
                    <p className="font-medium">{match.rule.name}</p>
                    <p className="text-sm text-text-secondary">{match.rule.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <p className="font-money font-bold text-accent-success whitespace-nowrap">
                      +&euro;{match.estimatedSaving.toLocaleString("it-IT")}
                    </p>
                    <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${expandedId === match.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === match.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-border-light space-y-4">
                      <p className="text-sm text-text-secondary">{match.rule.fullDescription}</p>
                      <div className="bg-bg-secondary rounded-sm p-4">
                        <h4 className="font-medium text-sm mb-1">Come richiederlo</h4>
                        <p className="text-sm text-text-secondary">{match.rule.howToClaim}</p>
                      </div>
                      {match.rule.requiredDocs.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Documenti necessari
                          </h4>
                          <ul className="text-sm text-text-secondary space-y-1">
                            {match.rule.requiredDocs.map((doc, i) => (
                              <li key={i}>&bull; {doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {match.rule.officialUrl && (
                        <Button size="sm" variant="secondary" asChild>
                          <a href={match.rule.officialUrl} target="_blank" rel="noopener noreferrer">
                            Sito ufficiale <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
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
