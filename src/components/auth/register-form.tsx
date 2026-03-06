"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non corrispondono.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined, referralCode: referralCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore durante la registrazione.");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account creato. Effettua il login manualmente.");
        setLoading(false);
        return;
      }

      router.push("/onboarding/personale");
    } catch {
      setError("Si è verificato un errore. Riprova tra qualche secondo.");
      setLoading(false);
    }
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

      <form onSubmit={handleRegister}>
        <div className="space-y-4 mb-4">
          <Input
            label="Nome (opzionale)"
            type="text"
            placeholder="Il tuo nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            placeholder="Minimo 8 caratteri"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="Conferma password"
            type="password"
            placeholder="Ripeti la password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" loading={loading} data-umami-event="register-submit">
          Registrati
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
