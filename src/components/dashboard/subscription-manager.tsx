"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/plans";
import { CreditCard, ExternalLink, ArrowUpRight } from "lucide-react";

interface SubscriptionManagerProps {
  currentPlan: string;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function SubscriptionManager({ currentPlan, subscription }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  async function handleUpgrade(planId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingPeriod: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  const plan = plans[currentPlan as keyof typeof plans] || plans.free;
  const statusLabel: Record<string, string> = {
    active: "Attivo",
    trialing: "Prova gratuita",
    past_due: "Pagamento in ritardo",
    canceled: "Cancellato",
    inactive: "Inattivo",
  };

  return (
    <div className="space-y-6">
      {/* Current plan card */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-medium">Piano {plan.name}</h2>
              <Badge variant={subscription?.status === "active" || subscription?.status === "trialing" ? "certo" : "consiglio"}>
                {statusLabel[subscription?.status || "inactive"] || subscription?.status}
              </Badge>
            </div>
            <p className="text-text-secondary text-sm mb-4">{plan.description}</p>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-text-secondary flex items-center gap-2">
                  <span className="text-accent-success">&#10003;</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right">
            {plan.priceMonthly !== undefined && plan.priceMonthly > 0 ? (
              <div>
                <span className="font-money text-3xl font-bold">&euro;{plan.priceMonthly}</span>
                <span className="text-text-muted text-sm">/mese</span>
              </div>
            ) : (
              <span className="font-money text-3xl font-bold">Gratis</span>
            )}
          </div>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-text-muted mt-4 pt-4 border-t border-border-light">
            {subscription.cancelAtPeriodEnd
              ? `Il tuo piano scadrà il ${new Date(subscription.currentPeriodEnd).toLocaleDateString("it-IT")}`
              : `Prossimo rinnovo: ${new Date(subscription.currentPeriodEnd).toLocaleDateString("it-IT")}`}
          </p>
        )}

        {currentPlan !== "free" && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <Button variant="secondary" onClick={handleManage} loading={loading}>
              <CreditCard className="h-4 w-4 mr-2" />
              Gestisci abbonamento
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Upgrade options */}
      {currentPlan === "free" && (
        <div>
          <h3 className="font-heading text-lg mb-4">Passa a un piano premium</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(["personale", "azienda"] as const).map((planId) => {
              const p = plans[planId];
              return (
                <Card key={planId} padding="lg">
                  <h4 className="font-medium text-lg mb-1">{p.name}</h4>
                  <p className="text-text-secondary text-sm mb-3">{p.description}</p>
                  <div className="mb-4">
                    <span className="font-money text-2xl font-bold">&euro;{p.priceMonthly}</span>
                    <span className="text-text-muted text-sm">/mese</span>
                  </div>
                  <Button onClick={() => handleUpgrade(planId)} loading={loading} className="w-full">
                    Prova gratis 7 giorni
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {currentPlan === "personale" && (
        <Card padding="lg">
          <h3 className="font-heading text-lg mb-2">Passa ad Azienda</h3>
          <p className="text-text-secondary text-sm mb-4">
            Accedi a incentivi imprese, crediti d&apos;imposta e bandi regionali.
          </p>
          <Button onClick={() => handleUpgrade("azienda")} loading={loading}>
            Upgrade ad Azienda &mdash; &euro;29/mese
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      )}
    </div>
  );
}
