"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("nodemailer", { email, callbackUrl: "/onboarding/personale" });
      setEmailSent(true);
    } catch {
      setError("Si è verificato un errore. Riprova tra qualche secondo.");
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-accent-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-heading text-2xl mb-2">Controlla la tua email</h2>
        <p className="text-text-secondary">
          Abbiamo inviato un link di verifica a <strong>{email}</strong>.
          Clicca sul link nell&apos;email per completare la registrazione.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-2">Crea il tuo account</h1>
      <p className="text-text-secondary mb-6">
        Scopri gratuitamente quanto stai perdendo ogni anno.
      </p>

      <div className="space-y-2 mb-8">
        {["Analisi personalizzata gratuita", "100+ regole di risparmio", "Aggiornamenti automatici"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
            <Check className="h-4 w-4 text-accent-success flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleEmailRegister}>
        <div className="mb-4">
          <Input
            label="Email"
            type="email"
            placeholder="tuaemail@esempio.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Registrati con email
        </Button>
        {error && (
          <p className="text-sm text-red-600 text-center mt-3">{error}</p>
        )}
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        Hai già un account?{" "}
        <a href="/login" className="text-accent-primary hover:underline">
          Accedi
        </a>
      </p>

      <p className="text-xs text-text-muted text-center mt-4">
        Registrandoti accetti i{" "}
        <a href="/termini" className="underline">Termini di Servizio</a>
        {" "}e la{" "}
        <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
