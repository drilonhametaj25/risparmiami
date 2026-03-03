"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Info, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CertaintyLevel = "certo" | "probabile" | "consiglio";

interface Bonus {
  name: string;
  description: string;
  maxAmount: string;
  requirements: {
    eta?: string[];
    reddito?: string[];
    figli?: string[];
    situazione?: string[];
  };
  certaintyLevel: CertaintyLevel;
  howToClaim: string;
}

interface Filters {
  eta: string;
  reddito: string;
  figli: string;
  situazione: string;
}

/* ------------------------------------------------------------------ */
/*  Bonus database                                                     */
/* ------------------------------------------------------------------ */

const bonuses: Bonus[] = [
  {
    name: "Assegno Unico Universale",
    description:
      "Assegno mensile per ogni figlio a carico fino a 21 anni. Importo variabile in base all\u2019ISEE.",
    maxAmount: "199,40\u00a0\u20ac/mese per figlio",
    requirements: { figli: ["1", "2", "3+"] },
    certaintyLevel: "certo",
    howToClaim: "Domanda online su INPS o tramite Patronato. Necessario ISEE aggiornato.",
  },
  {
    name: "Bonus Asilo Nido",
    description:
      "Contributo per le rette dell\u2019asilo nido (pubblico o privato) per bambini fino a 3 anni.",
    maxAmount: "3.600\u00a0\u20ac/anno",
    requirements: {
      figli: ["1", "2", "3+"],
      reddito: ["under9360", "9360_15000", "15000_25000", "25000_40000"],
    },
    certaintyLevel: "certo",
    howToClaim: "Domanda online su INPS. Allegare ricevute di pagamento rette.",
  },
  {
    name: "Carta Acquisti (Social Card)",
    description:
      "Carta prepagata da 80\u00a0\u20ac bimestrali per acquisti alimentari e bollette.",
    maxAmount: "480\u00a0\u20ac/anno",
    requirements: {
      eta: ["over65"],
      reddito: ["under9360"],
    },
    certaintyLevel: "certo",
    howToClaim: "Richiesta presso gli uffici postali con modulo dedicato.",
  },
  {
    name: "Carta Dedicata a Te",
    description:
      "Carta da 500\u00a0\u20ac per l\u2019acquisto di beni di prima necessit\u00e0 e carburante.",
    maxAmount: "500\u00a0\u20ac",
    requirements: {
      reddito: ["under9360", "9360_15000"],
    },
    certaintyLevel: "probabile",
    howToClaim: "Erogazione automatica ai beneficiari tramite Comuni. Controllare con il proprio Comune.",
  },
  {
    name: "Bonus Psicologo",
    description:
      "Contributo fino a 1.500\u00a0\u20ac per sedute di psicoterapia.",
    maxAmount: "1.500\u00a0\u20ac",
    requirements: {
      reddito: ["under9360", "9360_15000", "15000_25000", "25000_40000", "over40000"],
    },
    certaintyLevel: "probabile",
    howToClaim: "Domanda online su INPS durante le finestre temporali di apertura bando.",
  },
  {
    name: "Bonus Trasporti",
    description:
      "Contributo fino a 60\u00a0\u20ac per abbonamenti al trasporto pubblico.",
    maxAmount: "60\u00a0\u20ac",
    requirements: {
      reddito: ["under9360", "9360_15000", "15000_25000"],
    },
    certaintyLevel: "probabile",
    howToClaim: "Domanda sul portale dedicato del Ministero del Lavoro.",
  },
  {
    name: "Detrazioni Lavoro Dipendente",
    description:
      "Detrazione IRPEF automatica per i lavoratori dipendenti, proporzionale al reddito.",
    maxAmount: "1.955\u00a0\u20ac",
    requirements: {
      situazione: ["lavoratore"],
    },
    certaintyLevel: "certo",
    howToClaim: "Applicata automaticamente in busta paga dal datore di lavoro.",
  },
  {
    name: "Trattamento Integrativo (ex Bonus Renzi)",
    description:
      "Credito IRPEF di 100\u00a0\u20ac/mese per redditi fino a 15.000\u00a0\u20ac (o fino a 28.000\u00a0\u20ac con condizioni).",
    maxAmount: "1.200\u00a0\u20ac/anno",
    requirements: {
      situazione: ["lavoratore"],
      reddito: ["under9360", "9360_15000", "15000_25000"],
    },
    certaintyLevel: "certo",
    howToClaim: "Erogato automaticamente in busta paga. Verificare in dichiarazione dei redditi.",
  },
  {
    name: "Detrazioni Pensione",
    description:
      "Detrazione IRPEF per i titolari di redditi da pensione.",
    maxAmount: "1.955\u00a0\u20ac",
    requirements: {
      situazione: ["pensionato"],
    },
    certaintyLevel: "certo",
    howToClaim: "Applicata automaticamente dall\u2019INPS sul cedolino pensione.",
  },
  {
    name: "Bonus Mamme Lavoratrici",
    description:
      "Esonero contributivo per madri lavoratrici dipendenti con 2 o pi\u00f9 figli.",
    maxAmount: "3.000\u00a0\u20ac/anno",
    requirements: {
      situazione: ["lavoratore"],
      figli: ["2", "3+"],
    },
    certaintyLevel: "certo",
    howToClaim: "Comunicare al datore di lavoro i codici fiscali dei figli. Esonero applicato in automatico.",
  },
  {
    name: "NASpI (indennit\u00e0 disoccupazione)",
    description:
      "Indennit\u00e0 mensile per chi perde involontariamente il lavoro dipendente.",
    maxAmount: "1.550,42\u00a0\u20ac/mese",
    requirements: {
      situazione: ["disoccupato"],
    },
    certaintyLevel: "probabile",
    howToClaim: "Domanda online su INPS entro 68 giorni dalla cessazione del rapporto di lavoro.",
  },
  {
    name: "Assegno di Inclusione (ADI)",
    description:
      "Sostegno economico per nuclei con minori, disabili, over 60 o in condizioni di svantaggio.",
    maxAmount: "6.000\u00a0\u20ac/anno + integrazione affitto",
    requirements: {
      reddito: ["under9360"],
    },
    certaintyLevel: "probabile",
    howToClaim: "Domanda su INPS o Patronato. Richiesto ISEE, iscrizione SIISL e patto di attivazione digitale.",
  },
  {
    name: "Bonus Giovani Under 30 (Decontribuzione)",
    description:
      "Esonero contributivo per datori che assumono giovani under 30 a tempo indeterminato.",
    maxAmount: "Fino a 3.000\u00a0\u20ac/anno",
    requirements: {
      eta: ["under30"],
      situazione: ["lavoratore", "disoccupato"],
    },
    certaintyLevel: "consiglio",
    howToClaim: "Incentivo per il datore di lavoro. Informarsi presso l\u2019azienda o un consulente.",
  },
  {
    name: "Detrazione Spese Sanitarie",
    description:
      "Detrazione del 19% sulle spese mediche e sanitarie che superano la franchigia di 129,11\u00a0\u20ac.",
    maxAmount: "Nessun limite",
    requirements: {},
    certaintyLevel: "consiglio",
    howToClaim: "Conservare scontrini e fatture. Indicare le spese nella dichiarazione dei redditi (730/Unico).",
  },
  {
    name: "Detrazione Spese Istruzione",
    description:
      "Detrazione del 19% su tasse universitarie, mense e gite scolastiche (fino a 800\u00a0\u20ac per studente).",
    maxAmount: "152\u00a0\u20ac per figlio",
    requirements: {
      figli: ["1", "2", "3+"],
    },
    certaintyLevel: "consiglio",
    howToClaim: "Conservare ricevute. Le spese vengono pre-caricate nel 730 precompilato.",
  },
  {
    name: "Supporto Formazione e Lavoro (SFL)",
    description:
      "350\u00a0\u20ac/mese per partecipazione a percorsi formativi, per chi non ha diritto all\u2019ADI.",
    maxAmount: "4.200\u00a0\u20ac/anno",
    requirements: {
      situazione: ["disoccupato", "studente"],
      reddito: ["under9360", "9360_15000"],
    },
    certaintyLevel: "probabile",
    howToClaim: "Domanda su INPS. Richiesta partecipazione attiva a corsi di formazione o progetti utili.",
  },
];

/* ------------------------------------------------------------------ */
/*  Matching logic                                                     */
/* ------------------------------------------------------------------ */

function matchBonuses(filters: Filters): Bonus[] {
  return bonuses.filter((bonus) => {
    const req = bonus.requirements;

    // If bonus specifies requirement for a field, check user matches
    if (req.eta && req.eta.length > 0 && !req.eta.includes(filters.eta)) return false;
    if (req.reddito && req.reddito.length > 0 && !req.reddito.includes(filters.reddito)) return false;
    if (req.figli && req.figli.length > 0 && !req.figli.includes(filters.figli)) return false;
    if (req.situazione && req.situazione.length > 0 && !req.situazione.includes(filters.situazione))
      return false;

    return true;
  });
}

/* ------------------------------------------------------------------ */
/*  Certainty order helper                                             */
/* ------------------------------------------------------------------ */

const certaintyOrder: Record<CertaintyLevel, number> = { certo: 0, probabile: 1, consiglio: 2 };
const certaintyLabels: Record<CertaintyLevel, string> = {
  certo: "Certo",
  probabile: "Probabile",
  consiglio: "Consiglio",
};

/* ------------------------------------------------------------------ */
/*  Select component (styled)                                          */
/* ------------------------------------------------------------------ */

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-primary mb-1.5 font-body">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-colors duration-200 font-body"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function VerificaBonusClient() {
  const [filters, setFilters] = useState<Filters>({
    eta: "under30",
    reddito: "15000_25000",
    figli: "0",
    situazione: "lavoratore",
  });
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!submitted) return [];
    return matchBonuses(filters).sort(
      (a, b) => certaintyOrder[a.certaintyLevel] - certaintyOrder[b.certaintyLevel]
    );
  }, [filters, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const updateFilter = (key: keyof Filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  return (
    <section className="bg-bg-primary py-16 md:py-24 min-h-[80vh]">
      <Container size="narrow">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-3">
            Verifica Bonus 2025
          </h1>
          <p className="font-body text-text-secondary text-lg">
            Scopri a quali bonus e agevolazioni hai diritto in base alla tua situazione.
          </p>
        </div>

        {/* Form */}
        <Card padding="lg" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Età"
                value={filters.eta}
                onChange={updateFilter("eta")}
                options={[
                  { value: "under30", label: "Under 30" },
                  { value: "30_65", label: "30 – 65 anni" },
                  { value: "over65", label: "Over 65" },
                ]}
              />
              <Select
                label="Reddito ISEE"
                value={filters.reddito}
                onChange={updateFilter("reddito")}
                options={[
                  { value: "under9360", label: "Meno di 9.360\u00a0\u20ac" },
                  { value: "9360_15000", label: "9.360 \u2013 15.000\u00a0\u20ac" },
                  { value: "15000_25000", label: "15.000 \u2013 25.000\u00a0\u20ac" },
                  { value: "25000_40000", label: "25.000 \u2013 40.000\u00a0\u20ac" },
                  { value: "over40000", label: "Oltre 40.000\u00a0\u20ac" },
                ]}
              />
              <Select
                label="Figli a carico"
                value={filters.figli}
                onChange={updateFilter("figli")}
                options={[
                  { value: "0", label: "0" },
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3+", label: "3 o pi\u00f9" },
                ]}
              />
              <Select
                label="Situazione"
                value={filters.situazione}
                onChange={updateFilter("situazione")}
                options={[
                  { value: "lavoratore", label: "Lavoratore" },
                  { value: "studente", label: "Studente" },
                  { value: "disoccupato", label: "Disoccupato" },
                  { value: "pensionato", label: "Pensionato" },
                ]}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Verifica bonus disponibili
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        <AnimatePresence mode="wait">
          {submitted && (
            <motion.div
              key="bonus-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Summary */}
              <div className="mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-accent-primary flex-shrink-0" />
                <p className="font-body text-text-secondary">
                  <span className="font-medium text-text-primary">{results.length}</span>{" "}
                  {results.length === 1 ? "bonus trovato" : "bonus trovati"} per il tuo profilo
                </p>
              </div>

              {/* Bonus cards */}
              <div className="grid gap-4 mb-8">
                {results.map((bonus, i) => (
                  <motion.div
                    key={bonus.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.35 }}
                  >
                    <Card hover>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-heading text-lg text-text-primary">
                          {bonus.name}
                        </h3>
                        <Badge variant={bonus.certaintyLevel}>
                          {certaintyLabels[bonus.certaintyLevel]}
                        </Badge>
                      </div>
                      <p className="font-body text-text-secondary text-sm mb-3">
                        {bonus.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs text-text-secondary font-body">
                            Importo massimo
                          </span>
                          <p className="font-money text-accent-success text-lg">
                            {bonus.maxAmount}
                          </p>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <span className="text-xs text-text-secondary font-body">
                            Come richiederlo
                          </span>
                          <p className="font-body text-text-primary text-sm">
                            {bonus.howToClaim}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {results.length === 0 && (
                <Card padding="lg" className="text-center mb-8">
                  <p className="font-body text-text-secondary">
                    Nessun bonus specifico trovato per il tuo profilo. Prova a modificare
                    i filtri oppure registrati per un&apos;analisi pi\u00f9 approfondita.
                  </p>
                </Card>
              )}

              {/* CTA */}
              <Card padding="lg" className="text-center bg-bg-secondary">
                <h3 className="font-heading text-xl text-text-primary mb-2">
                  Vuoi assistenza nella richiesta dei bonus?
                </h3>
                <p className="font-body text-text-secondary mb-5">
                  Registrati per ricevere una guida passo-passo personalizzata e non
                  perdere nessuna scadenza.
                </p>
                <Link href="/registrati">
                  <Button size="lg">
                    Registrati gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
