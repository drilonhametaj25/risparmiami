import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Database,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Come Funziona — RisparmiaMi",
  description:
    "Scopri come RisparmiaMi analizza il tuo profilo finanziario e trova " +
    "le opportunita di risparmio che stai perdendo. Tre semplici passi: " +
    "crea il profilo, analisi automatica, agisci e risparmia.",
  alternates: { canonical: "https://risparmiami.pro/come-funziona" },
  openGraph: {
    title: "Come Funziona — RisparmiaMi",
    description:
      "Scopri come RisparmiaMi analizza il tuo profilo e trova risparmi nascosti " +
      "in tre semplici passi.",
    url: "https://risparmiami.pro/come-funziona",
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: ClipboardList,
    number: "01",
    title: "Crea il tuo profilo",
    subtitle: "5 minuti per raccontarci la tua situazione",
    description:
      "Compila il questionario con le informazioni sulla tua situazione personale " +
      "e finanziaria: reddito, composizione familiare, abitazione, utenze, " +
      "situazione lavorativa, previdenza e investimenti. Noi analizziamo 7 aree " +
      "della tua vita fiscale per trovare ogni opportunita.",
    details: [
      "Fisco e detrazioni",
      "Bonus e agevolazioni",
      "Bollette e utenze",
      "Assicurazioni",
      "Previdenza e TFR",
      "Abbonamenti e servizi",
      "Investimenti e conti",
    ],
  },
  {
    icon: Cpu,
    number: "02",
    title: "Analisi automatica",
    subtitle: "Il nostro motore lavora per te",
    description:
      "Il nostro rule engine confronta il tuo profilo con oltre 100 regole " +
      "aggiornate settimanalmente. Ogni regola e collegata a una fonte ufficiale " +
      "(Agenzia delle Entrate, INPS, ARERA). Per ogni opportunita trovata, " +
      "ti mostriamo il risparmio stimato e il livello di certezza.",
    details: [
      "100+ regole fiscali e finanziarie",
      "Aggiornamento settimanale delle fonti",
      "Risparmio stimato per ogni voce",
      "Livello di certezza trasparente",
      "Report personalizzato in PDF",
      "Alert automatici per nuove opportunita",
    ],
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Agisci e risparmia",
    subtitle: "Guide passo-passo per ogni azione",
    description:
      "Per ogni opportunita di risparmio, ricevi istruzioni chiare e dettagliate " +
      "su cosa fare, dove andare, quali documenti servono e quanto tempo ci vuole. " +
      "Tieni traccia dei risparmi ottenuti nella tua dashboard e ricevi " +
      "aggiornamenti automatici quando cambia qualcosa.",
    details: [
      "Istruzioni passo-passo in italiano semplice",
      "Documenti necessari e link diretti",
      "Tempo stimato per ogni azione",
      "Tracking dei risparmi ottenuti",
      "Aggiornamenti automatici del profilo",
      "Promemoria per scadenze importanti",
    ],
  },
];

const CERTAINTY_LEVELS = [
  {
    variant: "certo" as const,
    label: "Certo",
    icon: ShieldCheck,
    color: "text-accent-success",
    bgColor: "bg-accent-success/10",
    description:
      "Risparmio garantito. Basato su dati certi del tuo profilo e regole " +
      "fiscali inequivocabili. Esempio: detrazione per figli a carico non " +
      "applicata, bonus sociale energia non richiesto.",
  },
  {
    variant: "probabile" as const,
    label: "Probabile",
    icon: Zap,
    color: "text-accent-warning",
    bgColor: "bg-accent-warning/10",
    description:
      "Risparmio molto probabile. Richiede una verifica aggiuntiva o dipende " +
      "da condizioni che non possiamo confermare al 100%. Esempio: possibilita " +
      "di rinegoziare il mutuo, cambio fornitore energia.",
  },
  {
    variant: "consiglio" as const,
    label: "Consiglio",
    icon: BookOpen,
    color: "text-text-secondary",
    bgColor: "bg-bg-secondary",
    description:
      "Suggerimento utile. Un'opportunita che vale la pena esplorare ma " +
      "il risparmio effettivo dipende dalla tua situazione specifica. " +
      "Esempio: apertura conto deposito, revisione polizza assicurativa.",
  },
];

const DATA_SOURCES = [
  {
    name: "Agenzia delle Entrate",
    description: "Detrazioni, deduzioni, bonus fiscali, normativa tributaria",
  },
  {
    name: "INPS",
    description: "Bonus sociali, prestazioni previdenziali, assegni familiari",
  },
  {
    name: "ARERA",
    description: "Tariffe energia e gas, bonus sociali, mercato libero vs tutelato",
  },
  {
    name: "Banca d'Italia",
    description: "Tassi di interesse, mutui, conti correnti, trasparenza bancaria",
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */

export default function ComeFunzionaPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="bg-bg-primary py-20 md:py-28">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl text-text-primary">
              Come funziona RisparmiaMi
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed">
              Tre passi per scoprire quanto stai perdendo e iniziare a risparmiare.
              Nessuna competenza fiscale richiesta, nessun dato sensibile,
              risultati in pochi minuti.
            </p>
          </div>
        </Container>
      </section>

      {/* ---- 3 Steps Detail ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="space-y-20">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col ${
                  i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                } gap-12 items-center`}
              >
                {/* Icon + Number */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white border border-border-light shadow-sm">
                    <step.icon
                      className="h-12 w-12 text-accent-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="mt-4 text-sm font-mono text-accent-primary font-medium">
                    PASSO {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="font-heading text-2xl md:text-3xl text-text-primary">
                    {step.title}
                  </h2>
                  <p className="mt-1 text-base font-medium text-accent-primary">
                    {step.subtitle}
                  </p>
                  <p className="mt-4 text-body text-text-secondary leading-relaxed">
                    {step.description}
                  </p>

                  <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2.5">
                        <CheckCircle className="h-5 w-5 text-accent-success flex-shrink-0 mt-0.5" />
                        <span className="text-small text-text-secondary">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---- Certainty Levels ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Tre livelli di certezza
            </h2>
            <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
              Non tutte le opportunita di risparmio sono uguali. Per questo
              classifichiamo ogni suggerimento con un livello di certezza
              trasparente, cosi sai esattamente cosa aspettarti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CERTAINTY_LEVELS.map((level) => (
              <Card key={level.label} padding="lg" className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${level.bgColor} mb-4`}
                >
                  <level.icon className={`h-8 w-8 ${level.color}`} />
                </div>
                <Badge variant={level.variant} className="mb-3">
                  {level.label}
                </Badge>
                <p className="text-small text-text-secondary leading-relaxed">
                  {level.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ---- Data Sources ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Fonti ufficiali e verificate
            </h2>
            <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
              Ogni regola di risparmio e basata su fonti ufficiali italiane.
              Aggiorniamo le nostre regole settimanalmente per garantire
              informazioni sempre accurate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {DATA_SOURCES.map((source) => (
              <Card key={source.name} padding="md" className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-primary/10 mb-4">
                  <Database className="h-6 w-6 text-accent-primary" />
                </div>
                <h3 className="font-heading text-base text-text-primary font-semibold">
                  {source.name}
                </h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                  {source.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ---- CTA ---- */}
      <section className="bg-bg-primary py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Pronto a scoprire quanto risparmi?
            </h2>
            <p className="mt-4 text-body text-text-secondary">
              Inizia con il quiz gratuito: in 2 minuti scopri una stima del tuo
              risparmio. Oppure crea un account per l&apos;analisi completa.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/calcola-risparmio">
                  Calcola il tuo risparmio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/registrati">Crea account gratuito</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
