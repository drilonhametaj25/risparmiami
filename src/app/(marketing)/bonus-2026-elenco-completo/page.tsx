import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Home, Baby, Briefcase, GraduationCap, Heart, Euro, Gift, Shield, Zap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Bonus 2026: L'Elenco Completo di Tutti i Bonus Disponibili",
  description:
    "Tutti i bonus 2026 in Italia: famiglia, casa, lavoro, giovani, over 65. " +
    "Importi, requisiti ISEE, come fare domanda. Elenco aggiornato.",
  alternates: { canonical: "https://risparmiami.pro/bonus-2026-elenco-completo" },
  openGraph: {
    title: "Bonus 2026: L'Elenco Completo di Tutti i Bonus Disponibili",
    description:
      "Tutti i bonus 2026 in Italia organizzati per categoria. Scopri quali ti spettano " +
      "e come richiederli.",
    url: "https://risparmiami.pro/bonus-2026-elenco-completo",
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "article",
  },
};

/* ------------------------------------------------------------------ */
/*  Data: Bonus per categoria                                          */
/* ------------------------------------------------------------------ */

interface Bonus {
  name: string;
  maxAmount: string;
  isee: string;
  howToRequest: string;
  description: string;
}

interface BonusCategory {
  id: string;
  name: string;
  icon: typeof Baby;
  color: string;
  bgColor: string;
  bonuses: Bonus[];
}

const BONUS_CATEGORIES: BonusCategory[] = [
  {
    id: "famiglia",
    name: "Famiglia",
    icon: Baby,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    bonuses: [
      {
        name: "Assegno Unico Universale",
        maxAmount: "Fino a 199,40 euro/mese per figlio",
        isee: "Universale, importo modulato su ISEE",
        howToRequest: "Domanda INPS online o tramite patronato. Si rinnova ogni anno.",
        description:
          "L'assegno unico e universale per i figli a carico e riconosciuto dal settimo mese di " +
          "gravidanza fino ai 21 anni (senza limiti per figli disabili). L'importo varia da un " +
          "minimo di 57 euro a un massimo di 199,40 euro per figlio al mese, in base all'ISEE. " +
          "Maggiorazioni per famiglie numerose, figli disabili e madri under 21.",
      },
      {
        name: "Bonus Asilo Nido",
        maxAmount: "Fino a 3.600 euro/anno",
        isee: "Fino a 40.000 euro ISEE",
        howToRequest: "Domanda INPS online, allegando le ricevute di pagamento dell'asilo nido.",
        description:
          "Contributo per il pagamento della retta dell'asilo nido (pubblico o privato) o per " +
          "forme di supporto presso la propria abitazione per bambini sotto i 3 anni affetti da " +
          "gravi patologie. L'importo massimo e 3.600 euro per ISEE fino a 25.000 euro, " +
          "2.500 euro per ISEE fino a 40.000 euro.",
      },
      {
        name: "Bonus Nascita / Carta Dedicata a Te",
        maxAmount: "1.000 euro una tantum",
        isee: "ISEE fino a 40.000 euro",
        howToRequest: "Erogazione automatica su carta prepagata, nessuna domanda richiesta.",
        description:
          "Contributo una tantum di 1.000 euro per ogni figlio nato o adottato, erogato " +
          "automaticamente tramite una carta prepagata. Introdotto per sostenere le famiglie " +
          "nei primi mesi di vita del bambino. L'ISEE del nucleo familiare non deve superare i 40.000 euro.",
      },
      {
        name: "Congedo Parentale Indennizzato all'80%",
        maxAmount: "80% della retribuzione",
        isee: "Nessun requisito ISEE",
        howToRequest: "Domanda INPS online o tramite il datore di lavoro.",
        description:
          "Per il 2026, i genitori lavoratori dipendenti possono usufruire di 3 mesi di congedo " +
          "parentale indennizzati all'80% della retribuzione (anziche il 30% standard), da " +
          "utilizzare entro il sesto anno di vita del figlio.",
      },
    ],
  },
  {
    id: "casa",
    name: "Casa",
    icon: Home,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    bonuses: [
      {
        name: "Bonus Ristrutturazione",
        maxAmount: "Detrazione 36% su max 48.000 euro",
        isee: "Nessun requisito ISEE",
        howToRequest: "Pagamento con bonifico parlante, comunicazione ENEA per alcuni lavori.",
        description:
          "Detrazione del 36% per lavori di manutenzione straordinaria, restauro e risanamento " +
          "conservativo, ristrutturazione edilizia. Tetto di spesa 48.000 euro per unita immobiliare. " +
          "La detrazione e ripartita in 10 rate annuali di pari importo. Per la prima casa " +
          "verificare eventuali aliquote maggiorate.",
      },
      {
        name: "Bonus Mobili ed Elettrodomestici",
        maxAmount: "Detrazione 50% su max 5.000 euro",
        isee: "Nessun requisito ISEE",
        howToRequest: "Collegato a intervento di ristrutturazione. Pagamento tracciabile obbligatorio.",
        description:
          "Detrazione del 50% sull'acquisto di mobili e grandi elettrodomestici destinati ad " +
          "arredare l'immobile oggetto di ristrutturazione. Tetto di spesa 5.000 euro. " +
          "Requisito: aver avviato un intervento di ristrutturazione edilizia.",
      },
      {
        name: "Bonus Verde",
        maxAmount: "Detrazione 36% su max 5.000 euro",
        isee: "Nessun requisito ISEE",
        howToRequest: "Pagamento tracciabile, conservare fatture e ricevute.",
        description:
          "Detrazione del 36% per la sistemazione a verde di aree scoperte private: giardini, " +
          "terrazze, balconi. Include impianti di irrigazione, realizzazione di pozzi, coperture " +
          "a verde e giardini pensili. Tetto di spesa 5.000 euro per unita immobiliare.",
      },
      {
        name: "Bonus Prima Casa Under 36",
        maxAmount: "Esenzione imposte di registro e ipotecaria",
        isee: "ISEE fino a 40.000 euro",
        howToRequest: "Al momento del rogito notarile. Verificare la proroga per il 2026.",
        description:
          "Agevolazioni per l'acquisto della prima casa per giovani under 36: esenzione dall'imposta " +
          "di registro, ipotecaria e catastale. Per acquisti soggetti a IVA, credito d'imposta pari " +
          "all'IVA versata. Verificare se la misura e stata prorogata per il 2026.",
      },
    ],
  },
  {
    id: "lavoro",
    name: "Lavoro",
    icon: Briefcase,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    bonuses: [
      {
        name: "Trattamento Integrativo (ex Bonus Renzi)",
        maxAmount: "Fino a 1.200 euro/anno",
        isee: "Reddito fino a 28.000 euro",
        howToRequest: "Erogato automaticamente in busta paga dal datore di lavoro.",
        description:
          "Credito IRPEF di 100 euro al mese (1.200 euro/anno) per lavoratori dipendenti con " +
          "reddito complessivo fino a 15.000 euro. Per redditi tra 15.000 e 28.000 euro, " +
          "spetta solo se la somma delle detrazioni supera l'imposta lorda.",
      },
      {
        name: "Decontribuzione Lavoratrici Madri",
        maxAmount: "Esonero contributi fino a 3.000 euro/anno",
        isee: "Nessun requisito ISEE",
        howToRequest: "Applicato automaticamente dal datore di lavoro.",
        description:
          "Esonero totale dei contributi previdenziali a carico della lavoratrice madre (fino al " +
          "limite di 3.000 euro annui) con contratto a tempo indeterminato e almeno 2 figli. " +
          "L'esonero dura fino al compimento del decimo anno del figlio piu piccolo.",
      },
      {
        name: "Bonus Assunzione Giovani",
        maxAmount: "Esonero contributivo fino a 6.000 euro/anno",
        isee: "Nessun requisito ISEE",
        howToRequest: "Domanda del datore di lavoro tramite portale INPS.",
        description:
          "Esonero contributivo per i datori di lavoro che assumono giovani under 30 con contratto " +
          "a tempo indeterminato che non hanno mai avuto un contratto a tempo indeterminato. " +
          "L'esonero e pari al 100% dei contributi per un massimo di 36 mesi.",
      },
      {
        name: "Fringe Benefit Detassati",
        maxAmount: "Fino a 2.000 euro (con figli a carico)",
        isee: "Nessun requisito ISEE",
        howToRequest: "Accordo con il datore di lavoro, erogazione in busta paga o voucher.",
        description:
          "I fringe benefit (buoni pasto, buoni benzina, rimborsi utenze domestiche) sono esenti " +
          "da tassazione fino a 1.000 euro per tutti i lavoratori dipendenti, e fino a 2.000 euro " +
          "per lavoratori con figli a carico. Una forma di risparmio fiscale spesso sottovalutata.",
      },
    ],
  },
  {
    id: "giovani",
    name: "Giovani",
    icon: GraduationCap,
    color: "text-green-600",
    bgColor: "bg-green-50",
    bonuses: [
      {
        name: "Bonus Affitto Giovani",
        maxAmount: "Detrazione fino a 2.000 euro",
        isee: "Reddito fino a 15.493,71 euro",
        howToRequest: "In dichiarazione dei redditi (730 o Modello Redditi PF).",
        description:
          "Detrazione di 991,60 euro (minimo) per giovani tra 20 e 31 anni non compiuti che " +
          "stipulano un contratto di locazione per l'abitazione principale. Se il 20% del canone " +
          "supera 991,60 euro, la detrazione sale fino a un massimo di 2.000 euro.",
      },
      {
        name: "Carta Giovani Nazionale",
        maxAmount: "Sconti e agevolazioni varie",
        isee: "Nessun requisito ISEE, eta 18-35 anni",
        howToRequest: "Registrazione sull'app IO con SPID o CIE.",
        description:
          "Carta digitale che offre sconti e agevolazioni su cultura, sport, viaggi, alimentazione " +
          "e molto altro. Riservata ai giovani tra 18 e 35 anni residenti in Italia. Si attiva " +
          "gratuitamente dall'app IO e da accesso a offerte in tutta Italia e in Europa.",
      },
      {
        name: "Carta della Cultura e del Merito",
        maxAmount: "Fino a 1.000 euro",
        isee: "ISEE fino a 35.000 euro (Cultura) + merito (100/100)",
        howToRequest: "Domanda online sulla piattaforma dedicata del MiC.",
        description:
          "Due carte da 500 euro ciascuna per i diciottenni: la Carta della Cultura (per famiglie " +
          "con ISEE fino a 35.000 euro) e la Carta del Merito (per chi si diploma con 100/100). " +
          "Cumulabili, permettono di acquistare libri, biglietti per cinema, concerti, musei, corsi.",
      },
      {
        name: "Incentivo Autoimpiego nei Settori Strategici",
        maxAmount: "Esonero contributivo fino a 800 euro/mese",
        isee: "Under 35 anni",
        howToRequest: "Domanda tramite portale INPS o Agenzia Nazionale Politiche Attive del Lavoro.",
        description:
          "Per i giovani under 35 che avviano un'attivita imprenditoriale o di lavoro autonomo " +
          "nei settori strategici (transizione digitale, ecologica, turismo), e previsto un " +
          "esonero contributivo fino a 800 euro al mese per 3 anni.",
      },
    ],
  },
  {
    id: "over65",
    name: "Over 65",
    icon: Heart,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    bonuses: [
      {
        name: "Quattordicesima Pensionati",
        maxAmount: "Fino a 655 euro/anno",
        isee: "Reddito fino a 2 volte il trattamento minimo",
        howToRequest: "Erogata automaticamente dall'INPS a luglio.",
        description:
          "Somma aggiuntiva erogata ai pensionati over 64 con reddito personale fino a 2 volte " +
          "il trattamento minimo INPS. L'importo varia da 336 a 655 euro in base agli anni di " +
          "contributi versati e al reddito. Viene pagata automaticamente a luglio.",
      },
      {
        name: "Bonus Sociale Energia e Gas",
        maxAmount: "Sconto in bolletta (variabile)",
        isee: "ISEE fino a 9.530 euro (20.000 per famiglie numerose)",
        howToRequest: "Automatico con ISEE valido. Basta presentare la DSU.",
        description:
          "Sconto automatico sulle bollette di luce e gas per famiglie in difficolta economica. " +
          "Si applica automaticamente una volta presentata la DSU e ottenuto un ISEE valido " +
          "entro le soglie. Per famiglie con almeno 4 figli a carico, la soglia ISEE sale a 20.000 euro.",
      },
      {
        name: "Esenzione Ticket Sanitario",
        maxAmount: "Esenzione totale dai ticket",
        isee: "Over 65 con reddito familiare < 36.151,98 euro",
        howToRequest: "Richiesta alla ASL di appartenenza o autocertificazione dal medico.",
        description:
          "I cittadini over 65 con reddito familiare fiscale inferiore a 36.151,98 euro hanno " +
          "diritto all'esenzione dal ticket sanitario per tutte le prestazioni di diagnostica " +
          "strumentale, di laboratorio e le visite specialistiche. Codice esenzione E01.",
      },
      {
        name: "Assegno Sociale",
        maxAmount: "534,41 euro/mese (2026)",
        isee: "Over 67, senza reddito o reddito minimo",
        howToRequest: "Domanda INPS online o tramite patronato.",
        description:
          "Prestazione economica assistenziale erogata dall'INPS agli over 67 in condizioni " +
          "economiche disagiate, con reddito inferiore alle soglie stabilite annualmente. " +
          "L'importo e di 534,41 euro mensili per 13 mensilita, ridotto in proporzione al reddito.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Data: FAQ                                                          */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "bonus-faq-1",
    question: "Come faccio a sapere quali bonus mi spettano?",
    answer:
      "Il modo piu rapido e verificare la tua situazione su RisparmiaMi: inserisci il tuo profilo " +
      "e il nostro sistema confronta automaticamente i tuoi dati con tutti i bonus disponibili. " +
      "In alternativa, puoi consultare il sito INPS, il portale dell'Agenzia delle Entrate e " +
      "il sito del tuo Comune per i bonus locali.",
  },
  {
    id: "bonus-faq-2",
    question: "Serve l'ISEE per tutti i bonus?",
    answer:
      "No, non tutti i bonus richiedono l'ISEE. Alcuni, come l'Assegno Unico Universale, sono " +
      "accessibili a tutti ma l'importo varia in base all'ISEE. Altri, come il Bonus Ristrutturazione " +
      "o il Trattamento Integrativo, non richiedono l'ISEE ma hanno requisiti di reddito o di tipo " +
      "di lavoro. In generale, avere un ISEE aggiornato e sempre utile per accedere al maggior " +
      "numero di agevolazioni.",
  },
  {
    id: "bonus-faq-3",
    question: "Posso richiedere piu bonus contemporaneamente?",
    answer:
      "Si, nella maggior parte dei casi i bonus sono cumulabili tra loro. Ad esempio, puoi ricevere " +
      "l'Assegno Unico, il Bonus Asilo Nido e il Trattamento Integrativo contemporaneamente, " +
      "se ne hai i requisiti. Tuttavia, alcuni bonus specifici possono avere clausole di " +
      "incompatibilita. RisparmiaMi verifica automaticamente la compatibilita tra i bonus nel tuo profilo.",
  },
  {
    id: "bonus-faq-4",
    question: "Quando scadono le domande per i bonus 2026?",
    answer:
      "Ogni bonus ha scadenze diverse. L'Assegno Unico va rinnovato ogni anno (si consiglia entro " +
      "il 28 febbraio per non perdere gli arretrati). I bonus fiscali come il Bonus Ristrutturazione " +
      "si richiedono in dichiarazione dei redditi (entro il 30 settembre per il 730). I bonus INPS " +
      "hanno finestre specifiche. Con RisparmiaMi ricevi promemoria automatici per ogni scadenza.",
  },
  {
    id: "bonus-faq-5",
    question: "Cosa succede se ho diritto a un bonus ma non l'ho mai richiesto?",
    answer:
      "Per molti bonus e possibile fare domanda retroattiva e ricevere gli arretrati. Ad esempio, " +
      "l'Assegno Unico puo essere richiesto con arretrati fino a un certo numero di mesi. Per i " +
      "bonus fiscali, puoi presentare una dichiarazione integrativa entro 5 anni. Ti consigliamo " +
      "di verificare sempre la possibilita di recuperare le somme non percepite.",
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
  headline: "Bonus 2026: L'Elenco Completo di Tutti i Bonus Disponibili",
  description:
    "Tutti i bonus 2026 in Italia: famiglia, casa, lavoro, giovani, over 65. " +
    "Importi, requisiti ISEE, come fare domanda.",
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
  datePublished: "2026-01-10",
  dateModified: "2026-03-01",
};

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */

export default function Bonus2026ElencoCompletoPage() {
  const totalBonuses = BONUS_CATEGORIES.reduce((sum, cat) => sum + cat.bonuses.length, 0);

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
              {totalBonuses} bonus catalogati - Aggiornato Marzo 2026
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl text-text-primary">
              Bonus 2026: L&apos;Elenco Completo di Tutti i Bonus Disponibili
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed">
              Ogni anno lo Stato italiano mette a disposizione decine di bonus, agevolazioni e
              incentivi. Il problema? Molti italiani non sanno di averci diritto.
              Secondo l&apos;INPS, <strong className="text-text-primary">il 30% dei bonus disponibili non viene richiesto</strong>.
              In questa guida trovi tutti i bonus 2026 organizzati per categoria, con importi,
              requisiti e istruzioni per la domanda.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/verifica-bonus">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verifica i tuoi bonus
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

      {/* ---- Intro ---- */}
      <section className="bg-bg-secondary py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl text-text-primary mb-6">
              Come usare questa guida
            </h2>
            <div className="space-y-4 text-body text-text-secondary leading-relaxed">
              <p>
                Abbiamo organizzato tutti i bonus 2026 in <strong className="text-text-primary">5 categorie</strong>:
                Famiglia, Casa, Lavoro, Giovani e Over 65. Per ogni bonus trovi l&apos;importo massimo,
                i requisiti ISEE (quando previsti), una descrizione dettagliata e le istruzioni
                per fare domanda.
              </p>
              <p>
                Molti bonus sono <strong className="text-text-primary">cumulabili</strong> tra loro: una famiglia con figli
                piccoli, ad esempio, puo ricevere contemporaneamente l&apos;Assegno Unico, il Bonus
                Asilo Nido, il Bonus Nascita e i fringe benefit detassati. Il risparmio complessivo
                puo superare facilmente i <strong className="text-text-primary">5.000 euro all&apos;anno</strong>.
              </p>
            </div>

            {/* Quick navigation */}
            <div className="mt-8 flex flex-wrap gap-3">
              {BONUS_CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-light bg-white hover:bg-bg-secondary transition-colors text-sm font-medium text-text-primary"
                >
                  <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  {cat.name}
                  <span className="text-text-muted text-xs">({cat.bonuses.length})</span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Bonus per Categoria ---- */}
      {BONUS_CATEGORIES.map((cat, catIndex) => (
        <section
          key={cat.id}
          id={cat.id}
          className={catIndex % 2 === 0 ? "bg-bg-primary py-20" : "bg-bg-secondary py-20"}
        >
          <Container>
            <div className="flex items-center gap-4 mb-10">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${cat.bgColor}`}>
                <cat.icon className={`h-7 w-7 ${cat.color}`} />
              </div>
              <div>
                <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
                  Bonus {cat.name} 2026
                </h2>
                <p className="text-body text-text-secondary">
                  {cat.bonuses.length} bonus disponibili in questa categoria
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {cat.bonuses.map((bonus) => (
                <Card key={bonus.name} hover padding="lg">
                  <h3 className="font-heading text-lg text-text-primary font-semibold">
                    {bonus.name}
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-sm bg-bg-secondary">
                      <p className="text-xs text-text-muted uppercase tracking-wide font-medium">
                        Importo massimo
                      </p>
                      <p className="mt-1 text-sm font-semibold text-accent-primary">
                        {bonus.maxAmount}
                      </p>
                    </div>
                    <div className="p-3 rounded-sm bg-bg-secondary">
                      <p className="text-xs text-text-muted uppercase tracking-wide font-medium">
                        Requisito ISEE
                      </p>
                      <p className="mt-1 text-sm font-semibold text-text-primary">
                        {bonus.isee}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-small text-text-secondary leading-relaxed">
                    {bonus.description}
                  </p>

                  <div className="mt-4 p-3 rounded-sm bg-accent-primary/5 border border-accent-primary/10">
                    <p className="text-xs font-medium text-accent-primary mb-1">
                      Come fare domanda
                    </p>
                    <p className="text-xs text-text-secondary">
                      {bonus.howToRequest}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* ---- Riepilogo numerico ---- */}
      <section className="bg-accent-primary py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="font-heading text-4xl md:text-5xl font-bold">{totalBonuses}+</p>
              <p className="mt-2 text-sm opacity-80">Bonus catalogati</p>
            </div>
            <div>
              <p className="font-heading text-4xl md:text-5xl font-bold">5</p>
              <p className="mt-2 text-sm opacity-80">Categorie coperte</p>
            </div>
            <div>
              <p className="font-heading text-4xl md:text-5xl font-bold">30%</p>
              <p className="mt-2 text-sm opacity-80">Bonus non richiesti</p>
            </div>
            <div>
              <p className="font-heading text-4xl md:text-5xl font-bold">5.000+</p>
              <p className="mt-2 text-sm opacity-80">Euro risparmiabili/anno</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- ISEE: cosa sapere ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary text-center mb-8">
              ISEE 2026: cosa sapere per accedere ai bonus
            </h2>

            <div className="space-y-4">
              {[
                {
                  title: "Cos'e l'ISEE",
                  text: "L'Indicatore della Situazione Economica Equivalente e lo strumento che misura la condizione economica delle famiglie italiane. Tiene conto del reddito, del patrimonio mobiliare e immobiliare e della composizione del nucleo familiare.",
                },
                {
                  title: "Quando rinnovarlo",
                  text: "L'ISEE ha validita annuale e scade il 31 dicembre. Per il 2026, ti consigliamo di presentare la DSU (Dichiarazione Sostitutiva Unica) entro gennaio-febbraio per non perdere arretrati sui bonus che ne richiedono la presentazione.",
                },
                {
                  title: "Come ottenerlo",
                  text: "Puoi presentare la DSU online sul sito INPS (MyINPS), tramite un CAF o patronato (gratuito), oppure attraverso il tuo commercialista. Il calcolo e gratuito e il risultato e disponibile in pochi giorni.",
                },
                {
                  title: "ISEE corrente",
                  text: "Se la tua situazione economica e cambiata significativamente rispetto ai redditi dichiarati (perdita di lavoro, riduzione del reddito), puoi richiedere l'ISEE corrente che fotografa la situazione attuale anziche quella passata.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <CheckCircle className="h-6 w-6 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-base text-text-primary font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-small text-text-secondary leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ---- FAQ ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Domande frequenti sui bonus 2026
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
              Non perdere i bonus a cui hai diritto
            </h2>
            <p className="mt-4 text-body text-text-secondary">
              Con RisparmiaMi verifichi in pochi minuti tutti i bonus a cui hai diritto in base
              al tuo profilo. Ricevi istruzioni passo-passo per ogni domanda e promemoria
              automatici per le scadenze. Inizia gratis.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/verifica-bonus">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verifica i tuoi bonus
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
              Fonti: INPS, Agenzia delle Entrate, Legge di Bilancio 2026, DPCM attuativi
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
