"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type LoginMode = "email" | "password";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("nodemailer", { email, callbackUrl: "/dashboard" });
      setEmailSent(true);
    } catch {
      setError("Si è verificato un errore. Riprova tra qualche secondo.");
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o password non corretti.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
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
          Abbiamo inviato un link di accesso a <strong>{email}</strong>.
          Clicca sul link nell&apos;email per accedere.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-2">Accedi</h1>
      <p className="text-text-secondary mb-6">
        Accedi al tuo account per scoprire quanto puoi risparmiare.
      </p>

      {/* Tab toggle */}
      <div className="flex rounded-lg bg-bg-secondary p-1 mb-6">
        <button
          type="button"
          onClick={() => { setMode("password"); setError(""); }}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === "password"
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setMode("email"); setError(""); }}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === "email"
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Email magica
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin}>
          <div className="space-y-4 mb-4">
            <Input
              label="Email"
              type="email"
              placeholder="tuaemail@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Accedi
          </Button>
          {error && (
            <p className="text-sm text-red-600 text-center mt-3">{error}</p>
          )}
        </form>
      ) : (
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
      )}

      <p className="text-sm text-text-muted text-center mt-6">
        Non hai un account?{" "}
        <a href="/registrati" className="text-accent-primary hover:underline">
          Registrati gratis
        </a>
      </p>
    </div>
  );
}
