"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Lock } from "lucide-react";

interface UpgradeBannerProps {
  totalMatches: number;
  visibleMatches: number;
}

export function UpgradeBanner({ totalMatches, visibleMatches }: UpgradeBannerProps) {
  const [loading, setLoading] = useState(false);
  const hidden = totalMatches - visibleMatches;

  if (hidden <= 0) return null;

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "personale", billingPeriod: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <Card padding="lg" className="bg-bg-secondary border-accent-primary/20">
      <div className="flex items-center gap-3 mb-2">
        <Lock className="h-5 w-5 text-accent-primary" />
        <h3 className="font-heading text-lg">
          {hidden === 1
            ? `1 altra opportunità disponibile`
            : `Altre ${hidden} opportunità disponibili`}
        </h3>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Passa al piano Personale per sbloccare tutte le opportunità di risparmio personalizzate.
        Prova gratis per 7 giorni.
      </p>
      <Button onClick={handleUpgrade} loading={loading}>
        Sblocca tutto &mdash; Prova gratis 7 giorni
        <ArrowUpRight className="h-4 w-4 ml-1" />
      </Button>
    </Card>
  );
}
