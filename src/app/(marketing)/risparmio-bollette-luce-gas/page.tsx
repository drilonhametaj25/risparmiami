import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Flame, TrendingDown, Lightbulb, Thermometer, BarChart3, ShieldCheck, AlertTriangle, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Come Risparmiare sulle Bollette di Luce e Gas nel 2026",
  description:
    "Guida completa al risparmio sulle bollette di luce e gas nel 2026: costi medi per regione, " +
    "10 consigli pratici, bonus sociale, mercato libero vs tutelato. Risparmia fino a 500 euro/anno.",
  alternates: { canonical: "https://risparmiami.pro/risparmio-bollette-luce-gas" },
  openGraph: {
    title: "Come Risparmiare sulle Bollette di Luce e Gas nel 2026",
    description:
      "Guida pratica per risparmiare sulle bollette energetiche: consigli, bonus sociale " +
      "e confronto tariffe.",
    url: "https://risparmiami.pro/risparmio-bollette-luce-gas",
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "article",
  },
};

/* ------------------------------------------------------------------ */
/*  Data: Costi medi per regione                                       */
/* ------------------------------------------------------------------ */

interface RegionCost {
  region: string;
  luce: string;
  gas: string;
  totale: string;
}

const REGION_COSTS: RegionCost[] = [
  { region: "Lombardia", luce: "52 euro/mese", gas: "78 euro/mese", totale: "130 euro/mese" },
  { region: "Lazio", luce: "48 euro/mese", gas: "72 euro/mese", totale: "120 euro/mese" },
  { region: "Campania", luce: "45 euro/mese", gas: "65 euro/mese", totale: "110 euro/mese" },
  { region: "Piemonte", luce: "50 euro/mese", gas: "85 euro/mese", totale: "135 euro/mese" },
  { region: "Veneto", luce: "49 euro/mese", gas: "80 euro/mese", totale: "129 euro/mese" },
  { region: "Emilia-Romagna", luce: "51 euro/mese", gas: "82 euro/mese", totale: "133 euro/mese" },
  { region: "Toscana", luce: "47 euro/mese", gas: "74 euro/mese", totale: "121 euro/mese" },
  { region: "Sicilia", luce: "43 euro/mese", gas: "55 euro/mese", totale: "98 euro/mese" },
  { region: "Puglia", luce: "44 euro/mese", gas: "58 euro/mese", totale: "102 euro/mese" },
  { region: "Sardegna", luce: "46 euro/mese", gas: "52 euro/mese", totale: "98 euro/mese" },
];

/* ------------------------------------------------------------------ */
/*  Data: 10 consigli per risparmiare                                  */
/* ------------------------------------------------------------------ */

interface SavingTip {
  title: string;
  description: string;
  saving: string;
  icon: typeof Zap;
}

const SAVING_TIPS: SavingTip[] = [
  {
    title: "Confronta le offerte del mercato libero",
    description:
      "Dal 2024 il mercato tutelato per il gas e terminato. Confrontare le offerte dei diversi " +
      "fornitori e il primo passo per risparmiare. Usa il Portale Offerte di ARERA per confrontare " +
      "le tariffe in modo trasparente e imparziale. Il risparmio medio cambiando fornitore e di " +
      "100-200 euro all'anno.",
    saving: "100-200 euro/anno",
    icon: BarChart3,
  },
  {
    title: "Scegli una tariffa a prezzo fisso o variabile consapevolmente",
    description:
      "Le tariffe a prezzo fisso offrono stabilita: sai quanto pagherai per 12-24 mesi. " +
      "Le tariffe a prezzo variabile (indicizzate al PUN per la luce, al PSV per il gas) possono " +
      "costare meno ma comportano rischi di aumenti. In periodi di calo dei prezzi energetici, " +
      "il variabile conviene; in periodi di incertezza, il fisso offre tranquillita.",
    saving: "50-150 euro/anno",
    icon: TrendingDown,
  },
  {
    title: "Installa un termostato smart e valvole termostatiche",
    description:
      "Un termostato intelligente impara le tue abitudini e ottimizza il riscaldamento " +
      "automaticamente. Le valvole termostatiche sui singoli radiatori permettono di regolare " +
      "la temperatura stanza per stanza. L'investimento si ripaga in 1-2 stagioni di riscaldamento.",
    saving: "100-180 euro/anno",
    icon: Thermometer,
  },
  {
    title: "Usa gli elettrodomestici nelle fasce orarie piu economiche",
    description:
      "Se hai una tariffa bioraria o trioraria, usa lavatrice, lavastoviglie e asciugatrice " +
      "nelle fasce F2 (19:00-08:00 feriali) e F3 (weekend e festivi), quando il costo dell'energia " +
      "e piu basso. Programma gli elettrodomestici con il timer per sfruttare le ore notturne.",
    saving: "30-60 euro/anno",
    icon: Zap,
  },
  {
    title: "Sostituisci tutte le lampadine con LED",
    description:
      "Le lampadine LED consumano fino all'80% in meno rispetto alle alogene e durano 15-25 volte " +
      "di piu. Se non l'hai ancora fatto, sostituisci tutte le lampadine di casa con LED: " +
      "l'investimento si ripaga in pochi mesi. Scegli lampadine con classe energetica A.",
    saving: "30-50 euro/anno",
    icon: Lightbulb,
  },
  {
    title: "Abbassa il riscaldamento di 1 grado",
    description:
      "Ridurre la temperatura del termostato di un solo grado (da 21 a 20 gradi) riduce i " +
      "consumi di gas del 5-7%. In un appartamento medio, questo si traduce in 50-80 euro di " +
      "risparmio annuo. La temperatura ideale per la salute e il comfort e tra 19 e 20 gradi.",
    saving: "50-80 euro/anno",
    icon: Thermometer,
  },
  {
    title: "Controlla e migliora l'isolamento di casa",
    description:
      "Spifferi da finestre e porte causano dispersioni di calore significative. Applica guarnizioni " +
      "e paraspifferi (costo: pochi euro). Se possibile, valuta la sostituzione degli infissi con " +
      "il bonus ristrutturazione o ecobonus. Un buon isolamento riduce i consumi fino al 30%.",
    saving: "80-200 euro/anno",
    icon: ShieldCheck,
  },
  {
    title: "Elimina i consumi in standby",
    description:
      "TV, computer, caricatori e piccoli elettrodomestici in standby consumano energia 24 ore " +
      "al giorno. Si stima che i consumi in standby rappresentino il 5-10% della bolletta elettrica " +
      "di una famiglia. Usa multiprese con interruttore per spegnere tutto con un click.",
    saving: "30-50 euro/anno",
    icon: AlertTriangle,
  },
  {
    title: "Richiedi il Bonus Sociale se ne hai diritto",
    description:
      "Il bonus sociale luce e gas e uno sconto automatico in bolletta per famiglie con ISEE " +
      "fino a 9.530 euro (20.000 euro per famiglie con almeno 4 figli). Si attiva " +
      "automaticamente presentando la DSU e ottenendo un ISEE valido. Il risparmio puo " +
      "arrivare a diverse centinaia di euro all'anno.",
    saving: "200-400 euro/anno",
    icon: ShieldCheck,
  },
  {
    title: "Valuta il fotovoltaico con accumulo",
    description:
      "Un impianto fotovoltaico da 3 kW con batteria di accumulo puo coprire il 70-80% del " +
      "fabbisogno elettrico di una famiglia. Con le detrazioni fiscali (50% in 10 anni), " +
      "l'investimento si ripaga in 5-7 anni. Dopo, l'energia e praticamente gratis. Esistono anche " +
      "le comunita energetiche che permettono di condividere l'energia prodotta.",
    saving: "500-800 euro/anno",
    icon: Zap,
  },
];

/* ------------------------------------------------------------------ */
/*  Data: Bonus Sociale                                                */
/* ------------------------------------------------------------------ */

const BONUS_SOCIALE_DETAILS = [
  {
    title: "Chi ne ha diritto",
    items: [
      "Famiglie con ISEE fino a 9.530 euro",
      "Famiglie numerose (4+ figli) con ISEE fino a 20.000 euro",
      "Percettori di Reddito/Pensione di Cittadinanza",
      "Persone con gravi condizioni di salute che richiedono apparecchiature elettromedicali (bonus disagio fisico)",
    ],
  },
  {
    title: "Come si attiva",
    items: [
      "Presenta la DSU (Dichiarazione Sostitutiva Unica) al CAF, patronato o online su INPS",
      "Se il tuo ISEE rientra nelle soglie, il bonus si attiva automaticamente",
      "Nessuna domanda specifica da presentare al fornitore",
      "Il bonus viene applicato direttamente in bolletta come sconto",
    ],
  },
  {
    title: "Quanto si risparmia",
    items: [
      "Luce: sconto annuo tra 150 e 200 euro (varia per nucleo familiare)",
      "Gas: sconto annuo tra 60 e 260 euro (varia per zona climatica e nucleo)",
      "Disagio fisico: sconto aggiuntivo da 100 a 180 euro/anno",
      "Il bonus viene riconosciuto per 12 mesi e si rinnova automaticamente con DSU valida",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data: FAQ                                                          */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "bollette-faq-1",
    question: "Mercato libero o servizio di tutele graduali: quale conviene nel 2026?",
    answer:
      "Dal luglio 2024, il mercato tutelato dell'energia elettrica e stato sostituito dal Servizio " +
      "a Tutele Graduali (STG) per i clienti domestici non vulnerabili, gestito tramite aste. " +
      "Il gas e gia interamente nel mercato libero dal 2024. In generale, il mercato libero offre " +
      "piu scelta e potenzialmente tariffe migliori, ma richiede di confrontare le offerte. " +
      "Usa il Portale Offerte ARERA per un confronto imparziale. I clienti vulnerabili (over 75, " +
      "disabili, percettori bonus sociale) possono ancora accedere al servizio di maggior tutela.",
  },
  {
    id: "bollette-faq-2",
    question: "Come si legge la bolletta della luce?",
    answer:
      "La bolletta della luce si compone di 4 voci principali: 1) Spesa per la materia energia " +
      "(il costo dell'energia consumata, la voce su cui puoi risparmiare cambiando fornitore), " +
      "2) Spesa per il trasporto e la gestione del contatore (costi di rete, uguali per tutti), " +
      "3) Oneri di sistema (costi per incentivi alle rinnovabili, uguali per tutti), " +
      "4) Imposte (IVA e accise). Solo la prima voce cambia tra un fornitore e l'altro.",
  },
  {
    id: "bollette-faq-3",
    question: "Il bonus sociale si applica automaticamente?",
    answer:
      "Si, dal 2021 il bonus sociale e automatico. Basta presentare la DSU (Dichiarazione " +
      "Sostitutiva Unica) per ottenere l'ISEE. Se il tuo ISEE rientra nelle soglie previste, " +
      "il bonus viene applicato automaticamente nelle bollette successive, senza bisogno di " +
      "presentare domanda specifica al fornitore. Il bonus viene rinnovato ogni 12 mesi, " +
      "a condizione di avere un ISEE valido.",
  },
  {
    id: "bollette-faq-4",
    question: "Conviene passare alla tariffa monoraria o bioraria?",
    answer:
      "Dipende dalle tue abitudini di consumo. Se consumi energia principalmente nelle ore " +
      "serali e nel weekend (tipico di chi lavora fuori casa), la tariffa bioraria o trioraria " +
      "puo farti risparmiare. Se invece consumi in modo uniforme durante la giornata (lavoro " +
      "da casa, pensionati), la tariffa monoraria e piu conveniente. Analizza la tua bolletta " +
      "per capire la distribuzione dei tuoi consumi per fascia oraria.",
  },
  {
    id: "bollette-faq-5",
    question: "Quanto si risparmia davvero cambiando fornitore di luce e gas?",
    answer:
      "Il risparmio varia molto in base alla tariffa attuale e a quella nuova. In media, " +
      "cambiando fornitore si possono risparmiare tra 100 e 200 euro all'anno sulla luce e " +
      "tra 80 e 150 euro all'anno sul gas. Il risparmio e maggiore se si passa da una tariffa " +
      "del mercato tutelato a un'offerta competitiva del mercato libero. Il cambio fornitore " +
      "e gratuito, non comporta interruzioni di servizio e si completa in poche settimane.",
  },
];

/* ------------------------------------------------------------------ */
/*  JSON-LD Structured Data                                            */
/* ------------------------------------------------------------------ */

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Come Risparmiare sulle Bollette di Luce e Gas nel 2026",
  description:
    "Guida completa al risparmio sulle bollette di luce e gas nel 2026: costi medi per regione, " +
    "10 consigli pratici, bonus sociale, mercato libero vs tutelato.",
  author: {
    "@type": "Organization",
    name: "RisparmiaMi",
    url: "https://risparmiami.pro",
  },
  publisher: {
    "@type": "Organization",
    name: "RisparmiaMi",
    url: "https://risparmiami.pro",
  },
  datePublished: "2026-01-20",
  dateModified: "2026-03-01",
};

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */

export default function RisparmioBollettePage() {
  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* ---- Hero ---- */}
      <section className="bg-bg-primary py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="certo" className="mb-4">
              Guida Aggiornata Marzo 2026
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl text-text-primary">
              Come Risparmiare sulle Bollette di Luce e Gas nel 2026
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed">
              Una famiglia italiana spende in media <strong className="text-text-primary">1.400 euro
              all&apos;anno</strong> tra bollette di luce e gas. Con i giusti accorgimenti e
              sfruttando tutte le agevolazioni disponibili, puoi risparmiare
              fino a <strong className="text-text-primary">500 euro all&apos;anno</strong> senza rinunciare
              al comfort. In questa guida trovi consigli pratici, costi medi per regione e tutto
              quello che devi sapere sul bonus sociale.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/confronta-bollette">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Confronta le tue bollette
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/registrati">
                  Analisi completa gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Il mercato energetico nel 2026 ---- */}
      <section className="bg-bg-secondary py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl text-text-primary mb-6">
              Il mercato energetico italiano nel 2026: cosa e cambiato
            </h2>
            <div className="space-y-4 text-body text-text-secondary leading-relaxed">
              <p>
                Il mercato energetico italiano ha subito cambiamenti significativi negli ultimi anni.
                Dal <strong className="text-text-primary">1 luglio 2024</strong>, il mercato tutelato
                dell&apos;energia elettrica e stato sostituito dal <strong className="text-text-primary">Servizio
                a Tutele Graduali (STG)</strong> per i clienti domestici non vulnerabili. Il mercato
                tutelato del gas era gia terminato nel gennaio 2024.
              </p>
              <p>
                Questo significa che nel 2026 la grande maggioranza delle famiglie italiane e nel
                <strong className="text-text-primary"> mercato libero</strong>, dove i prezzi sono determinati dalla
                concorrenza tra fornitori. E una grande opportunita di risparmio, ma richiede
                attenzione: non tutte le offerte sono uguali e alcune possono nascondere costi extra.
              </p>
              <p>
                I prezzi dell&apos;energia nel 2026 sono relativamente stabili rispetto ai picchi del
                2022-2023, ma restano superiori ai livelli pre-crisi. Il prezzo medio dell&apos;energia
                elettrica sul mercato libero si aggira intorno a <strong className="text-text-primary">0,22-0,28
                euro/kWh</strong>, mentre il gas naturale costa circa <strong className="text-text-primary">0,80-1,10
                euro/Smc</strong> a seconda del fornitore e del tipo di contratto.
              </p>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Card padding="md" className="text-center">
                <Zap className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                <p className="font-heading text-2xl font-bold text-text-primary">0,22-0,28</p>
                <p className="text-sm text-text-secondary">euro/kWh luce (mercato libero)</p>
              </Card>
              <Card padding="md" className="text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <p className="font-heading text-2xl font-bold text-text-primary">0,80-1,10</p>
                <p className="text-sm text-text-secondary">euro/Smc gas (mercato libero)</p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Costi medi per regione ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
                <MapPin className="inline h-8 w-8 mr-2 text-accent-primary" />
                Costi medi delle bollette per regione
              </h2>
              <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
                I costi energetici variano significativamente da regione a regione, principalmente
                per le differenze nei consumi di gas (legati alla zona climatica) e nelle abitudini
                di consumo. Ecco una stima dei costi medi mensili per le principali regioni italiane.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="py-4 px-4 text-small font-medium text-text-secondary border-b border-border-light">
                      Regione
                    </th>
                    <th className="py-4 px-4 text-center text-small font-medium text-text-secondary border-b border-border-light">
                      <Zap className="inline h-4 w-4 mr-1 text-amber-500" />
                      Luce
                    </th>
                    <th className="py-4 px-4 text-center text-small font-medium text-text-secondary border-b border-border-light">
                      <Flame className="inline h-4 w-4 mr-1 text-orange-500" />
                      Gas
                    </th>
                    <th className="py-4 px-4 text-center text-small font-medium border-b-2 border-accent-primary">
                      <span className="text-accent-primary font-semibold">Totale</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REGION_COSTS.map((r, i) => (
                    <tr
                      key={r.region}
                      className={i % 2 === 0 ? "bg-bg-primary" : "bg-bg-secondary/50"}
                    >
                      <td className="py-3.5 px-4 text-small text-text-primary font-medium border-b border-border-light">
                        {r.region}
                      </td>
                      <td className="py-3.5 px-4 text-center text-small text-text-secondary border-b border-border-light">
                        {r.luce}
                      </td>
                      <td className="py-3.5 px-4 text-center text-small text-text-secondary border-b border-border-light">
                        {r.gas}
                      </td>
                      <td className="py-3.5 px-4 text-center text-small font-semibold text-accent-primary border-b border-border-light border-l border-r border-accent-primary/20 bg-accent-primary/[0.02]">
                        {r.totale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-text-muted text-center">
              * Stime basate su consumi medi di una famiglia di 3-4 persone in appartamento.
              Fonte: elaborazione su dati ARERA Q1 2026.
            </p>
          </div>
        </Container>
      </section>

      {/* ---- 10 Consigli per Risparmiare ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              10 consigli pratici per risparmiare sulle bollette
            </h2>
            <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
              Dalla scelta del fornitore ai piccoli accorgimenti quotidiani: ecco i consigli
              piu efficaci per ridurre le bollette di luce e gas, ordinati per impatto economico.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {SAVING_TIPS.map((tip, i) => (
              <Card key={tip.title} padding="lg">
                <div className="flex gap-5 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
                      <span className="font-mono text-sm font-bold text-accent-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-heading text-lg text-text-primary font-semibold">
                        {tip.title}
                      </h3>
                      <Badge variant="certo" className="self-start">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {tip.saving}
                      </Badge>
                    </div>
                    <p className="text-small text-text-secondary leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Risparmio totale */}
          <div className="mt-12 max-w-2xl mx-auto">
            <Card padding="lg" className="bg-accent-primary text-white border-accent-primary">
              <div className="text-center">
                <p className="text-sm opacity-80 uppercase tracking-wide font-medium">
                  Risparmio potenziale totale applicando tutti i consigli
                </p>
                <p className="mt-2 font-heading text-4xl md:text-5xl font-bold">
                  Fino a 1.270+ euro/anno
                </p>
                <p className="mt-2 text-sm opacity-80">
                  Il risparmio effettivo dipende dalla tua situazione, dal tipo di abitazione e
                  dalle tue abitudini di consumo.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ---- Bonus Sociale ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
                <ShieldCheck className="inline h-8 w-8 mr-2 text-accent-success" />
                Bonus Sociale Energia 2026
              </h2>
              <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
                Il bonus sociale e uno sconto automatico in bolletta per le famiglie in difficolta
                economica. Dal 2021 e diventato automatico: basta avere un ISEE valido entro
                le soglie previste.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {BONUS_SOCIALE_DETAILS.map((section) => (
                <Card key={section.title} padding="lg">
                  <h3 className="font-heading text-lg text-text-primary font-semibold mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-accent-success flex-shrink-0 mt-0.5" />
                        <span className="text-small text-text-secondary leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-accent-success/5 rounded-md border border-accent-success/20 max-w-3xl mx-auto">
              <h3 className="font-heading text-lg text-text-primary font-semibold mb-2">
                Non stai ricevendo il bonus sociale? Controlla subito
              </h3>
              <p className="text-small text-text-secondary leading-relaxed">
                Molte famiglie che ne hanno diritto non ricevono il bonus sociale semplicemente perche
                non hanno presentato la DSU. Se il tuo ISEE e inferiore a 9.530 euro (o 20.000 euro
                con 4+ figli), vai al CAF piu vicino o accedi a MyINPS per presentare la DSU.
                Il bonus verra applicato automaticamente nelle bollette successive.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Mercato libero vs Tutele Graduali ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary text-center mb-8">
              Mercato Libero vs Tutele Graduali: come scegliere
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card padding="lg">
                <div className="text-center mb-4">
                  <Badge variant="certo">Mercato Libero</Badge>
                </div>
                <ul className="space-y-3">
                  {[
                    "Ampia scelta tra decine di fornitori",
                    "Tariffe potenzialmente piu basse",
                    "Offerte a prezzo fisso o variabile",
                    "Promozioni e sconti per nuovi clienti",
                    "Richiede confronto attivo delle offerte",
                    "Rischio di offerte poco trasparenti",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${i < 4 ? "text-accent-success" : "text-accent-warning"}`} />
                      <span className="text-small text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card padding="lg">
                <div className="text-center mb-4">
                  <Badge variant="probabile">Servizio Tutele Graduali</Badge>
                </div>
                <ul className="space-y-3">
                  {[
                    "Tariffa stabilita tramite aste competitive",
                    "Nessuna scelta attiva richiesta",
                    "Trasparenza totale sui costi",
                    "Protezione per chi non vuole scegliere",
                    "Meno flessibilita sulle condizioni",
                    "Disponibile solo per chi non ha scelto il mercato libero",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${i < 4 ? "text-accent-success" : "text-accent-warning"}`} />
                      <span className="text-small text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <p className="mt-6 text-small text-text-secondary text-center leading-relaxed">
              <strong className="text-text-primary">Il nostro consiglio:</strong> confronta sempre
              le offerte del mercato libero con il costo del Servizio a Tutele Graduali. Usa il
              Portale Offerte di ARERA (portaleofferte.arera.it) per un confronto imparziale.
              Con RisparmiaMi puoi inserire la tua bolletta attuale e scoprire se stai pagando troppo.
            </p>
          </div>
        </Container>
      </section>

      {/* ---- FAQ ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Domande frequenti sul risparmio in bolletta
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </Container>
      </section>

      {/* ---- CTA Finale ---- */}
      <section className="bg-bg-secondary py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Stai pagando troppo per luce e gas?
            </h2>
            <p className="mt-4 text-body text-text-secondary">
              Con RisparmiaMi analizzi le tue bollette in pochi minuti e scopri se puoi
              risparmiare cambiando fornitore, ottimizzando i consumi o richiedendo il bonus
              sociale. Confronto gratuito e senza impegno.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/confronta-bollette">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Confronta le tue bollette
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/registrati">
                  Crea account gratuito
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Fonti: ARERA, Autorita di Regolazione per Energia Reti e Ambiente, dati Q1 2026
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
