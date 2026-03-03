import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, FileText, Calendar, CheckCircle, Euro, Users, Home, GraduationCap, Heart, Briefcase, Baby, Landmark, Shield } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Detrazioni Fiscali 2026: Guida Completa a Tutte le Detrazioni",
  description:
    "Elenco completo delle detrazioni fiscali 2026 in Italia: spese mediche, mutuo, " +
    "ristrutturazione, istruzione, affitto e molto altro. Scopri quali ti spettano.",
  alternates: { canonical: "https://risparmiami.pro/detrazioni-fiscali-2026" },
  openGraph: {
    title: "Detrazioni Fiscali 2026: Guida Completa a Tutte le Detrazioni",
    description:
      "Elenco completo delle detrazioni fiscali 2026 in Italia. Scopri quali detrazioni " +
      "ti spettano e quanto puoi risparmiare.",
    url: "https://risparmiami.pro/detrazioni-fiscali-2026",
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "article",
  },
};

/* ------------------------------------------------------------------ */
/*  Data: Detrazioni                                                   */
/* ------------------------------------------------------------------ */

const DETRAZIONI = [
  {
    icon: Heart,
    name: "Spese Mediche e Sanitarie",
    percentage: "19%",
    maxAmount: "Nessun limite",
    franchigia: "Franchigia di 129,11 euro",
    who: "Tutti i contribuenti",
    description:
      "Visite specialistiche, farmaci, analisi, ricoveri, protesi, dispositivi medici. " +
      "Si detrae il 19% della spesa eccedente la franchigia di 129,11 euro. Non c'e un tetto massimo.",
  },
  {
    icon: Home,
    name: "Interessi Mutuo Prima Casa",
    percentage: "19%",
    maxAmount: "Fino a 760 euro/anno",
    franchigia: "Su max 4.000 euro di interessi",
    who: "Proprietari prima casa",
    description:
      "Detrazione del 19% sugli interessi passivi del mutuo per l'acquisto dell'abitazione principale, " +
      "fino a un massimo di 4.000 euro di interessi annui. Il risparmio massimo e di circa 760 euro.",
  },
  {
    icon: Home,
    name: "Ristrutturazione Edilizia",
    percentage: "36%",
    maxAmount: "Fino a 17.280 euro",
    franchigia: "Su max 48.000 euro di spesa",
    who: "Proprietari e inquilini",
    description:
      "Detrazione del 36% per interventi di recupero edilizio, ripartita in 10 rate annuali. " +
      "Il tetto di spesa e 48.000 euro per unita immobiliare. Per la prima casa, nel 2025 l'aliquota era al 50%: " +
      "verifica se proroghe sono state confermate per il 2026.",
  },
  {
    icon: Home,
    name: "Ecobonus - Riqualificazione Energetica",
    percentage: "50-65%",
    maxAmount: "Fino a 100.000 euro",
    franchigia: "Variabile per intervento",
    who: "Proprietari e inquilini",
    description:
      "Detrazione dal 50% al 65% per interventi di efficientamento energetico: " +
      "cappotto termico, sostituzione infissi, caldaie a condensazione, pannelli solari termici. " +
      "Il tetto varia da 30.000 a 100.000 euro a seconda dell'intervento.",
  },
  {
    icon: GraduationCap,
    name: "Spese di Istruzione",
    percentage: "19%",
    maxAmount: "Fino a 152 euro",
    franchigia: "Su max 800 euro di spesa",
    who: "Genitori e studenti",
    description:
      "Detrazione del 19% sulle spese per la frequenza scolastica (infanzia, primaria, secondaria) " +
      "fino a 800 euro per figlio. Per l'universita, il tetto varia in base alla regione e alla facolta.",
  },
  {
    icon: GraduationCap,
    name: "Spese Universitarie",
    percentage: "19%",
    maxAmount: "Variabile per regione",
    franchigia: "Tetti stabiliti dal MUR",
    who: "Studenti e famiglie",
    description:
      "Detrazione del 19% sulle tasse universitarie. Per le universita statali non c'e limite. " +
      "Per le universita private, il MUR stabilisce tetti annuali per area disciplinare e regione.",
  },
  {
    icon: Home,
    name: "Canoni di Affitto",
    percentage: "19%",
    maxAmount: "Fino a 500 euro",
    franchigia: "Per redditi fino a 31.000 euro",
    who: "Inquilini a basso reddito",
    description:
      "Detrazione per i canoni di locazione dell'abitazione principale: 300 euro per redditi fino a " +
      "15.493,71 euro, 150 euro per redditi tra 15.493,71 e 30.987,41 euro. Maggiorazione per giovani under 31.",
  },
  {
    icon: Baby,
    name: "Spese per Figli a Carico",
    percentage: "19%",
    maxAmount: "Variabile",
    franchigia: "Diverse tipologie",
    who: "Genitori con figli a carico",
    description:
      "Detrazione del 19% per spese sportive dei figli (max 210 euro per figlio), " +
      "spese per asilo nido (max 632 euro), spese per centri estivi e attivita extrascolastiche.",
  },
  {
    icon: Shield,
    name: "Assicurazioni Vita e Infortuni",
    percentage: "19%",
    maxAmount: "Fino a 110 euro",
    franchigia: "Su max 530 euro di premi",
    who: "Tutti i contribuenti",
    description:
      "Detrazione del 19% sui premi assicurativi per polizze vita e infortuni, " +
      "fino a un massimo di 530 euro. Per le polizze rischio eventi calamitosi il tetto sale a 750 euro.",
  },
  {
    icon: Landmark,
    name: "Erogazioni Liberali e Donazioni",
    percentage: "26-30%",
    maxAmount: "Variabile",
    franchigia: "Per ONLUS e partiti politici",
    who: "Tutti i contribuenti",
    description:
      "Detrazione del 26% per donazioni a ONLUS e associazioni di promozione sociale, " +
      "fino a 30.000 euro. Per le donazioni ai partiti politici la detrazione e del 26% tra 30 e 30.000 euro.",
  },
];

/* ------------------------------------------------------------------ */
/*  Data: Scaglioni / Aliquote                                         */
/* ------------------------------------------------------------------ */

const TIERS = [
  {
    percentage: "19%",
    description: "La detrazione piu comune",
    examples: "Spese mediche, interessi mutuo, istruzione, affitto, assicurazioni, spese veterinarie",
  },
  {
    percentage: "26%",
    description: "Erogazioni liberali",
    examples: "Donazioni a ONLUS, associazioni di promozione sociale, partiti politici",
  },
  {
    percentage: "36%",
    description: "Ristrutturazione edilizia (base)",
    examples: "Interventi di manutenzione straordinaria, restauro, risanamento conservativo",
  },
  {
    percentage: "50%",
    description: "Ristrutturazione (prima casa 2025, verifica proroghe 2026)",
    examples: "Interventi su prima casa, acquisto mobili ed elettrodomestici (Bonus Mobili collegato)",
  },
  {
    percentage: "65%",
    description: "Ecobonus massimo",
    examples: "Cappotto termico, sostituzione impianti con pompe di calore, pannelli solari",
  },
];

/* ------------------------------------------------------------------ */
/*  Data: Scadenze                                                     */
/* ------------------------------------------------------------------ */

const SCADENZE = [
  {
    date: "28 febbraio 2026",
    title: "CU - Certificazione Unica",
    description: "I datori di lavoro inviano la CU ai dipendenti e all'Agenzia delle Entrate.",
  },
  {
    date: "30 aprile 2026",
    title: "Precompilata disponibile",
    description: "L'Agenzia delle Entrate mette a disposizione il modello 730 precompilato online.",
  },
  {
    date: "20 maggio 2026",
    title: "Invio 730 precompilato",
    description: "Apertura dell'invio del modello 730 precompilato e ordinario.",
  },
  {
    date: "30 settembre 2026",
    title: "Scadenza invio 730",
    description: "Termine ultimo per l'invio del modello 730 (ordinario e precompilato).",
  },
  {
    date: "30 novembre 2026",
    title: "Scadenza Modello Redditi PF",
    description: "Termine per l'invio del Modello Redditi Persone Fisiche (ex Unico).",
  },
];

/* ------------------------------------------------------------------ */
/*  Data: FAQ                                                          */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "faq-1",
    question: "Qual e la differenza tra detrazione e deduzione fiscale?",
    answer:
      "La detrazione riduce direttamente l'imposta lorda (IRPEF) dovuta. Ad esempio, una detrazione del 19% " +
      "su 1.000 euro di spese mediche riduce le tasse di 190 euro. La deduzione, invece, riduce il reddito " +
      "imponibile su cui si calcolano le tasse. In pratica, la detrazione ti fa pagare meno tasse in modo diretto, " +
      "la deduzione riduce la base su cui si calcolano. Entrambe permettono di risparmiare, ma con meccanismi diversi.",
  },
  {
    id: "faq-2",
    question: "Posso detrarre le spese mediche pagate in contanti?",
    answer:
      "No, dal 2020 le spese detraibili al 19% devono essere pagate con metodi tracciabili: bonifico, " +
      "carta di credito, carta di debito, assegno o altri strumenti tracciabili. Fanno eccezione le spese per " +
      "l'acquisto di medicinali, dispositivi medici e le prestazioni sanitarie rese da strutture pubbliche o " +
      "convenzionate con il SSN, che possono ancora essere pagate in contanti.",
  },
  {
    id: "faq-3",
    question: "Quanto posso risparmiare con le detrazioni fiscali nel 2026?",
    answer:
      "Il risparmio varia molto in base alla situazione personale. Una famiglia media italiana con mutuo, " +
      "figli a scuola e spese mediche ordinarie puo risparmiare tra 1.500 e 3.000 euro all'anno. Chi ha anche " +
      "spese per ristrutturazione o efficientamento energetico puo arrivare a risparmi ancora maggiori. " +
      "Con RisparmiaMi puoi calcolare il tuo risparmio personalizzato in pochi minuti.",
  },
  {
    id: "faq-4",
    question: "Le detrazioni fiscali 2026 cambiano rispetto al 2025?",
    answer:
      "La Legge di Bilancio 2026 ha confermato la maggior parte delle detrazioni esistenti, con alcune " +
      "modifiche. La detrazione per ristrutturazione edilizia torna all'aliquota base del 36% (dal 50% previsto " +
      "per la prima casa nel 2025), salvo nuove proroghe. L'Ecobonus mantiene le aliquote differenziate per " +
      "tipologia di intervento. Le detrazioni sanitarie, per istruzione e mutuo restano sostanzialmente invariate. " +
      "Ti consigliamo di verificare sempre le ultime novita con RisparmiaMi.",
  },
  {
    id: "faq-5",
    question: "Come faccio a non dimenticare nessuna detrazione nella dichiarazione dei redditi?",
    answer:
      "Il modo piu semplice e utilizzare la dichiarazione precompilata dell'Agenzia delle Entrate, che gia " +
      "include molte spese comunicate da terzi (medici, farmacie, banche, scuole). Tuttavia, alcune spese " +
      "vanno aggiunte manualmente. RisparmiaMi analizza il tuo profilo completo e ti segnala tutte le " +
      "detrazioni che potresti star perdendo, con istruzioni passo-passo per ciascuna.",
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
  headline: "Detrazioni Fiscali 2026: Guida Completa a Tutte le Detrazioni",
  description:
    "Elenco completo delle detrazioni fiscali 2026 in Italia: spese mediche, mutuo, " +
    "ristrutturazione, istruzione, affitto e molto altro.",
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
  datePublished: "2026-01-15",
  dateModified: "2026-03-01",
};

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */

export default function DetrazioniFiscali2026Page() {
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
              Aggiornato a Marzo 2026
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl text-text-primary">
              Detrazioni Fiscali 2026: La Guida Completa
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed">
              Ogni anno gli italiani perdono in media <strong className="text-text-primary">1.200 euro</strong> di
              detrazioni fiscali a cui hanno diritto. Spese mediche dimenticate, interessi del
              mutuo non dichiarati, ristrutturazioni non comunicate: le opportunita mancate sono
              tante. In questa guida trovi l&apos;elenco completo di tutte le detrazioni fiscali
              disponibili nel 2026, con importi, requisiti e istruzioni pratiche.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/calcola-risparmio">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calcola le tue detrazioni
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

      {/* ---- Introduzione ---- */}
      <section className="bg-bg-secondary py-16">
        <Container>
          <div className="max-w-3xl mx-auto prose-like">
            <h2 className="font-heading text-2xl md:text-3xl text-text-primary mb-6">
              Cosa sono le detrazioni fiscali e perche sono importanti
            </h2>
            <div className="space-y-4 text-body text-text-secondary leading-relaxed">
              <p>
                Le <strong className="text-text-primary">detrazioni fiscali</strong> sono riduzioni
                dell&apos;imposta sul reddito (IRPEF) che lo Stato italiano riconosce ai contribuenti
                per determinate spese sostenute durante l&apos;anno. A differenza delle deduzioni, che
                riducono il reddito imponibile, le detrazioni agiscono direttamente sull&apos;imposta
                dovuta, riducendo l&apos;importo che devi pagare al Fisco.
              </p>
              <p>
                Nel 2026, il sistema fiscale italiano prevede decine di detrazioni diverse, che vanno
                dalle spese sanitarie all&apos;istruzione, dal mutuo per la prima casa alla
                ristrutturazione edilizia, dalle donazioni alle polizze assicurative. Conoscere tutte
                le detrazioni disponibili e il primo passo per non lasciare soldi sul tavolo.
              </p>
              <p>
                Il problema? La normativa e complessa e cambia spesso. Molti contribuenti non sanno
                di avere diritto a determinate detrazioni oppure dimenticano di inserirle nella
                dichiarazione dei redditi. Secondo le stime dell&apos;Agenzia delle Entrate, ogni anno
                restano non richieste detrazioni per miliardi di euro.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Elenco Detrazioni ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Le principali detrazioni fiscali 2026
            </h2>
            <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
              Ecco l&apos;elenco delle detrazioni piu importanti e utilizzate dai contribuenti
              italiani. Per ciascuna trovi la percentuale, l&apos;importo massimo e chi ne ha diritto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {DETRAZIONI.map((d) => (
              <Card key={d.name} hover padding="lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-primary/10">
                    <d.icon className="h-6 w-6 text-accent-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg text-text-primary font-semibold">
                      {d.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="certo">{d.percentage}</Badge>
                      <Badge variant="default">{d.maxAmount}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-text-muted">{d.franchigia}</p>
                    <p className="mt-3 text-small text-text-secondary leading-relaxed">
                      {d.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-accent-primary">
                      <Users className="inline h-3.5 w-3.5 mr-1" />
                      {d.who}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ---- Come funzionano le aliquote ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
                Come funzionano le aliquote di detrazione
              </h2>
              <p className="mt-4 text-body text-text-secondary max-w-2xl mx-auto">
                Non tutte le detrazioni hanno la stessa percentuale. Ecco le principali aliquote
                previste dal sistema fiscale italiano nel 2026.
              </p>
            </div>

            <div className="space-y-4">
              {TIERS.map((tier) => (
                <Card key={tier.percentage} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-primary/10">
                        <span className="font-heading text-xl font-bold text-accent-primary">
                          {tier.percentage}
                        </span>
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-base text-text-primary font-semibold">
                        {tier.description}
                      </h3>
                      <p className="mt-1 text-small text-text-secondary">
                        {tier.examples}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-accent-primary/5 rounded-md border border-accent-primary/20">
              <h3 className="font-heading text-lg text-text-primary font-semibold mb-3">
                <Calculator className="inline h-5 w-5 mr-2 text-accent-primary" />
                Come si calcola il risparmio?
              </h3>
              <div className="space-y-3 text-small text-text-secondary leading-relaxed">
                <p>
                  Il calcolo e semplice: <strong className="text-text-primary">Risparmio = Spesa sostenuta x Aliquota di detrazione</strong>.
                  Ad esempio, se hai speso 2.000 euro in visite mediche, il tuo risparmio e:
                  (2.000 - 129,11) x 19% = <strong className="text-text-primary">355,57 euro</strong>.
                </p>
                <p>
                  Per la ristrutturazione, se hai speso 30.000 euro con aliquota al 36%, il risparmio
                  totale e di <strong className="text-text-primary">10.800 euro</strong>, ripartiti in 10 rate annuali da 1.080 euro.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Scadenze 2026 ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
                <Calendar className="inline h-8 w-8 mr-2 text-accent-primary" />
                Scadenze importanti 2026
              </h2>
              <p className="mt-4 text-body text-text-secondary">
                Le date chiave per la dichiarazione dei redditi e le detrazioni fiscali 2026.
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border-light hidden md:block" />

              <div className="space-y-8">
                {SCADENZE.map((s, i) => (
                  <div key={s.date} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center font-mono text-sm font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-mono text-accent-primary font-medium">
                        {s.date}
                      </p>
                      <h3 className="mt-1 font-heading text-lg text-text-primary font-semibold">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-small text-text-secondary leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Consigli pratici ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary text-center mb-8">
              5 consigli per non perdere neanche un euro
            </h2>

            <div className="space-y-4">
              {[
                {
                  title: "Conserva tutte le ricevute e gli scontrini fiscali",
                  text: "Anche se molte spese vengono comunicate automaticamente all'Agenzia delle Entrate, e importante conservare la documentazione per almeno 5 anni. In caso di controllo, servira come prova.",
                },
                {
                  title: "Paga sempre con metodi tracciabili",
                  text: "Dal 2020 le detrazioni al 19% richiedono pagamento tracciabile (carta, bonifico, assegno). Unica eccezione: farmaci e prestazioni del SSN. Non rischiare di perdere la detrazione per aver pagato in contanti.",
                },
                {
                  title: "Controlla la dichiarazione precompilata con attenzione",
                  text: "La precompilata non include tutto. Verifica che siano presenti tutte le spese mediche, le spese scolastiche, i premi assicurativi e le altre spese detraibili. Aggiungi manualmente quelle mancanti.",
                },
                {
                  title: "Non dimenticare le spese dei familiari a carico",
                  text: "Se hai familiari fiscalmente a carico (coniuge, figli, genitori), puoi detrarre anche le loro spese mediche, scolastiche e altre spese ammesse. E una fonte di risparmio spesso dimenticata.",
                },
                {
                  title: "Usa RisparmiaMi per un'analisi completa",
                  text: "Il nostro sistema analizza il tuo profilo completo e confronta la tua situazione con oltre 100 regole fiscali aggiornate. In pochi minuti scopri tutte le detrazioni che ti spettano, con istruzioni chiare su come richiederle.",
                },
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent-success mt-0.5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base text-text-primary font-semibold">
                      {tip.title}
                    </h3>
                    <p className="mt-1 text-small text-text-secondary leading-relaxed">
                      {tip.text}
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
              Domande frequenti sulle detrazioni fiscali 2026
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
              Non lasciare soldi sul tavolo
            </h2>
            <p className="mt-4 text-body text-text-secondary">
              Ogni anno migliaia di italiani perdono detrazioni a cui hanno diritto. Con RisparmiaMi
              scopri in pochi minuti tutte le detrazioni che ti spettano e ricevi istruzioni
              passo-passo per richiederle. Inizia gratis.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/tools/calcola-risparmio">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calcola il tuo risparmio
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
              <FileText className="inline h-3.5 w-3.5 mr-1" />
              Fonti: Agenzia delle Entrate, Testo Unico delle Imposte sui Redditi (TUIR), Legge di Bilancio 2026
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
