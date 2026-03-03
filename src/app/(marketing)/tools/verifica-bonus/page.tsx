import type { Metadata } from "next";
import { VerificaBonusClient } from "./bonus-client";

export const metadata: Metadata = {
  title: "Verifica Bonus 2025 | RisparmiaAMi - Scopri i bonus a cui hai diritto",
  description:
    "Controlla in pochi click quali bonus, agevolazioni e detrazioni fiscali puoi richiedere nel 2025. Verifica gratuita basata sulla tua situazione.",
  alternates: {
    canonical: "https://risparmiami.pro/tools/verifica-bonus",
  },
  openGraph: {
    url: "https://risparmiami.pro/tools/verifica-bonus",
    title: "Verifica i Bonus a cui hai diritto | RisparmiaAMi",
    description:
      "Scopri subito quali bonus statali, agevolazioni e detrazioni puoi ottenere. Verifica gratuita e personalizzata.",
  },
};

export default function VerificaBonusPage() {
  return <VerificaBonusClient />;
}
