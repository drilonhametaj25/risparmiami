"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";

interface ActionItem {
  id: string;
  ruleId: string;
  ruleName: string;
  ruleCategory: string;
  estimatedSaving: number;
  certainty: string;
  deadline: string | null;
}

interface PriorityActionsProps {
  actions: ActionItem[];
}

export function PriorityActions({ actions }: PriorityActionsProps) {
  if (actions.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="font-heading text-lg mb-2">Azioni prioritarie</h3>
        <p className="text-text-secondary text-sm">
          Nessuna azione in sospeso. Ottimo lavoro!
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg">Azioni prioritarie</h3>
        <Link href="/dashboard/azioni" className="text-sm text-accent-primary hover:underline">
          Vedi tutte <ArrowRight className="h-3 w-3 inline" />
        </Link>
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant={action.certainty as "certo" | "probabile" | "consiglio"} className="text-xs">
                  {action.certainty}
                </Badge>
                <span className="text-xs text-text-muted capitalize">{action.ruleCategory}</span>
              </div>
              <p className="text-sm font-medium truncate">{action.ruleName}</p>
              {action.deadline && (
                <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  Scadenza: {new Date(action.deadline).toLocaleDateString("it-IT")}
                </p>
              )}
            </div>
            <p className="font-money text-sm font-bold text-accent-success ml-3">
              +€{action.estimatedSaving.toLocaleString("it-IT")}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
