import type { Metadata } from "next";
import { ChecklistAbbonamentiClient } from "./checklist-client";

export const metadata: Metadata = {
  title: "Checklist Abbonamenti | RisparmiaAMi - Trova gli abbonamenti dimenticati",
  description:
    "Calcola quanto spendi ogni mese in abbonamenti e servizi ricorrenti. Trova quelli dimenticati e scopri quanto puoi risparmiare eliminando quelli inutili.",
  alternates: {
    canonical: "https://risparmiami.pro/tools/checklist-abbonamenti",
  },
  openGraph: {
    url: "https://risparmiami.pro/tools/checklist-abbonamenti",
    title: "Checklist Abbonamenti - Quanto spendi ogni mese? | RisparmiaAMi",
    description:
      "Seleziona i tuoi abbonamenti attivi e scopri il totale mensile e annuale. Strumento gratuito per ottimizzare le spese ricorrenti.",
  },
};

export default function ChecklistAbbonamentiPage() {
  return <ChecklistAbbonamentiClient />;
}
