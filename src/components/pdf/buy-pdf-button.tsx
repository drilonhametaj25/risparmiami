"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BuyPdfButtonProps {
  label: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  isLoggedIn?: boolean;
}

export function BuyPdfButton({ label, size = "lg", showIcon = true, isLoggedIn = false }: BuyPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout(guestEmail?: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pdf",
          ...(guestEmail ? { email: guestEmail } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore durante il checkout");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Errore di connessione");
      setLoading(false);
    }
  }

  function handleBuy() {
    if (isLoggedIn) {
      handleCheckout();
    } else {
      setShowEmailField(true);
    }
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Inserisci un'email valida");
      return;
    }
    handleCheckout(email);
  }

  if (showEmailField && !isLoggedIn) {
    return (
      <form onSubmit={handleGuestSubmit} className="space-y-3 w-full">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="La tua email per ricevere la guida"
            required
            className="w-full border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          />
          {error && <p className="text-sm text-accent-danger mt-1">{error}</p>}
        </div>
        <Button type="submit" size={size} loading={loading} className="w-full">
          Procedi al pagamento
          {showIcon && <Download className="h-5 w-5 ml-2" />}
        </Button>
        <button
          type="button"
          onClick={() => setShowEmailField(false)}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors w-full text-center"
        >
          Annulla
        </button>
      </form>
    );
  }

  return (
    <Button size={size} onClick={handleBuy} loading={loading}>
      {label}
      {showIcon && <Download className="h-5 w-5 ml-2" />}
    </Button>
  );
}
