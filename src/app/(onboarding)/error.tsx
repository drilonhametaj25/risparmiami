"use client";

import { Button } from "@/components/ui/button";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="font-heading text-xl mb-3">Errore nell&apos;onboarding</h2>
      <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
        Si è verificato un errore. Riprova o torna alla dashboard.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Riprova</Button>
        <Button variant="secondary" asChild>
          <a href="/dashboard">Vai alla dashboard</a>
        </Button>
      </div>
    </div>
  );
}
