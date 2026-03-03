"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("resend", { email, callbackUrl: "/dashboard" });
      setEmailSent(true);
    } catch {
      setError("Si è verificato un errore. Riprova tra qualche secondo.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/dashboard" });
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
          Abbiamo inviato un link di accesso a <strong>{email}</strong>.
          Clicca sul link nell&apos;email per accedere.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-2">Accedi</h1>
      <p className="text-text-secondary mb-8">
        Accedi al tuo account per scoprire quanto puoi risparmiare.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 border border-border-light rounded-sm px-4 py-2.5 hover:bg-bg-secondary transition-colors mb-6"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continua con Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-light" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-bg-primary px-4 text-text-muted">oppure</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin}>
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
          Invia link di accesso
        </Button>
        {error && (
          <p className="text-sm text-red-600 text-center mt-3">{error}</p>
        )}
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        Non hai un account?{" "}
        <a href="/registrati" className="text-accent-primary hover:underline">
          Registrati gratis
        </a>
      </p>
    </div>
  );
}
