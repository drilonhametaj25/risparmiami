import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifica Email",
};

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="font-heading text-3xl mb-3">Controlla la tua email</h1>
      <p className="text-text-secondary max-w-sm mx-auto mb-8">
        Ti abbiamo inviato un link per accedere. Controlla la tua casella di posta
        (e lo spam) e clicca sul link per continuare.
      </p>
      <p className="text-sm text-text-muted">
        Non hai ricevuto l&apos;email?{" "}
        <a href="/login" className="text-accent-primary hover:underline">
          Riprova
        </a>
      </p>
    </div>
  );
}
