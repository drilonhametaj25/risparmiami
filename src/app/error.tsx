"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-4xl mb-4">Qualcosa non ha funzionato</h1>
        <p className="text-text-secondary mb-8">
          Si è verificato un errore imprevisto. Riprova o torna alla pagina iniziale.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-accent-primary text-white rounded-sm hover:bg-accent-primary/90 transition-colors"
          >
            Riprova
          </button>
          <a
            href="/"
            className="px-6 py-2.5 border border-border-light rounded-sm hover:bg-bg-secondary transition-colors"
          >
            Torna alla home
          </a>
        </div>
      </div>
    </div>
  );
}
