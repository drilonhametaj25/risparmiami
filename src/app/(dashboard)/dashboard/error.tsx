"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="font-heading text-xl mb-3">Qualcosa è andato storto</h2>
      <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
        Si è verificato un errore nel caricamento della dashboard. Riprova o contatta il supporto se il problema persiste.
      </p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
