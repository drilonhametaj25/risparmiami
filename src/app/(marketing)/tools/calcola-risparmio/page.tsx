import type { Metadata } from "next";
import { CalcolaRisparmioQuiz } from "./quiz-client";

export const metadata: Metadata = {
  title: "Calcola Risparmio | RisparmiaAMi - Quanto puoi risparmiare?",
  description:
    "Scopri in 2 minuti quanto potresti risparmiare ogni anno tra bonus, detrazioni fiscali e ottimizzazione delle spese. Quiz gratuito e personalizzato.",
  alternates: {
    canonical: "https://risparmiami.pro/tools/calcola-risparmio",
  },
  openGraph: {
    url: "https://risparmiami.pro/tools/calcola-risparmio",
    title: "Calcola il tuo Risparmio Annuo | RisparmiaAMi",
    description:
      "Quiz gratuito: rispondi a 5 domande e scopri quanto puoi risparmiare con bonus, detrazioni e ottimizzazioni.",
  },
};

export default function CalcolaRisparmioPage() {
  return <CalcolaRisparmioQuiz />;
}
