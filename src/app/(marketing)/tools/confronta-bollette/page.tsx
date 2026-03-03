import type { Metadata } from "next";
import { ConfrontaBolletteClient } from "./bollette-client";

export const metadata: Metadata = {
  title: "Confronta Bollette | RisparmiaAMi - Stai pagando troppo?",
  description:
    "Confronta le tue bollette di luce e gas con la media italiana della tua regione. Scopri subito se stai pagando troppo e quanto puoi risparmiare.",
  alternates: {
    canonical: "https://risparmiami.pro/tools/confronta-bollette",
  },
  openGraph: {
    url: "https://risparmiami.pro/tools/confronta-bollette",
    title: "Confronta le tue Bollette con la Media Italiana | RisparmiaAMi",
    description:
      "Inserisci le tue spese e scopri se paghi pi\u00f9 della media regionale. Strumento gratuito con dati ARERA aggiornati.",
  },
};

export default function ConfrontaBollettePage() {
  return <ConfrontaBolletteClient />;
}
