import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Prezzi — RisparmiaMi",
  description:
    "Prezzi semplici e trasparenti per RisparmiaMi. Inizia gratis con il quiz " +
    "risparmio, oppure scegli il piano Personale o Azienda per l'analisi " +
    "completa con oltre 100 regole di risparmio.",
  alternates: { canonical: "https://risparmiami.pro/prezzi" },
  openGraph: {
    title: "Prezzi — RisparmiaMi",
    description:
      "Prezzi trasparenti. Inizia gratis, upgrade quando vuoi, cancella quando vuoi.",
    url: "https://risparmiami.pro/prezzi",
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  Comparison Table Data                                              */
/* ------------------------------------------------------------------ */

interface ComparisonFeature {
  name: string;
  gratis: boolean | string;
  personale: boolean | string;
  azienda: boolean | string;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Quiz risparmio rapido",
    gratis: true,
    personale: true,
    azienda: true,
  },
  {
    name: "Consigli generici",
    gratis: "3 consigli",
    personale: "Illimitati",
    azienda: "Illimitati",
  },
  {
    name: "Accesso al blog",
    gratis: true,
    personale: true,
    azienda: true,
  },
  {
    name: "Profilo completo personalizzato",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "100+ regole di risparmio",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "Analisi su 7 aree",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "Report PDF personalizzato",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "Aggiornamenti automatici",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "Alert email per scadenze e bonus",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "Tracking risparmi ottenuti",
    gratis: false,
    personale: true,
    azienda: true,
  },
  {
    name: "Incentivi per imprese",
    gratis: false,
    personale: false,
    azienda: true,
  },
  {
    name: "Crediti d'imposta aziendali",
    gratis: false,
    personale: false,
    azienda: true,
  },
  {
    name: "Monitor bandi regionali",
    gratis: false,
    personale: false,
    azienda: true,
  },
  {
    name: "Supporto prioritario",
    gratis: false,
    personale: false,
    azienda: true,
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */

const PRICING_FAQ: AccordionItem[] = [
  {
    id: "faq-1",
    question: "Posso cancellare quando voglio?",
    answer:
      "Assolutamente si. Puoi cancellare il tuo abbonamento in qualsiasi momento " +
      "dalla dashboard del tuo account. Nessun vincolo, nessuna penale. Continuerai " +
      "ad avere accesso al servizio fino alla fine del periodo gia pagato.",
  },
  {
    id: "faq-2",
    question: "C'e un periodo di prova?",
    answer:
      "Si. Il piano Personale include 7 giorni di prova gratuita. Puoi provare " +
      "tutte le funzionalita senza inserire la carta di credito. Se non ti " +
      "convince, non paghi nulla.",
  },
  {
    id: "faq-3",
    question: "Quali metodi di pagamento accettate?",
    answer:
      "Accettiamo tutte le principali carte di credito e debito (Visa, Mastercard, " +
      "American Express), PayPal e bonifico bancario SEPA per i piani annuali. " +
      "Tutti i pagamenti sono processati in modo sicuro tramite Stripe.",
  },
  {
    id: "faq-4",
    question: "Cosa succede se passo dal piano mensile ad annuale?",
    answer:
      "Puoi passare al piano annuale in qualsiasi momento. Ti verra accreditato " +
      "il periodo rimanente del piano mensile e applicato lo sconto del 17% " +
      "sul piano annuale. Il passaggio e immediato.",
  },
  {
    id: "faq-5",
    question: "Il piano Gratis ha limiti di tempo?",
    answer:
      "No. Il piano Gratis e gratuito per sempre. Include il quiz risparmio, " +
      "3 consigli generici e l'accesso completo al blog. Puoi fare l'upgrade " +
      "al piano Personale o Azienda quando vuoi.",
  },
  {
    id: "faq-6",
    question: "Posso richiedere il rimborso?",
    answer:
      "Si. Se non sei soddisfatto, puoi richiedere il rimborso completo entro " +
      "30 giorni dall'acquisto. Nessuna domanda. Basta inviare un'email a " +
      "supporto@risparmiami.pro o usare il modulo nella dashboard.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helper Component                                                   */
/* ------------------------------------------------------------------ */

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-small text-text-secondary">{value}</span>
    );
  }
  if (value) {
    return <Check className="h-5 w-5 text-accent-success mx-auto" />;
  }
  return <X className="h-5 w-5 text-text-muted/40 mx-auto" />;
}

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */

export default function PrezziPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="bg-bg-primary py-20 md:py-28">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl text-text-primary">
              Prezzi semplici, risparmio reale
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed">
              Inizia gratis. Upgrade quando vuoi. Cancella quando vuoi.
              Nessun costo nascosto, nessun vincolo.
            </p>

            {/* Social proof */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="font-money font-bold text-text-primary text-lg">153+</span>
                <span>regole di risparmio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-money font-bold text-text-primary text-lg">9</span>
                <span>categorie analizzate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-money font-bold text-text-primary text-lg">&euro;3.000+</span>
                <span>risparmio medio stimato</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Pricing Cards (reusable component) ---- */}
      <PricingTable />

      {/* ---- Comparison Table ---- */}
      <section className="bg-bg-primary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Confronta i piani nel dettaglio
            </h2>
            <p className="mt-4 text-body text-text-secondary">
              Tutte le funzionalita a colpo d&apos;occhio.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-small font-medium text-text-secondary border-b border-border-light w-2/5">
                    Funzionalita
                  </th>
                  <th className="py-4 px-4 text-center text-small font-medium text-text-secondary border-b border-border-light w-1/5">
                    <div>Gratis</div>
                    <div className="font-mono text-text-primary font-bold mt-1">
                      &euro;0
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-small font-medium border-b-2 border-accent-primary w-1/5">
                    <div className="text-accent-primary font-semibold">
                      Personale
                    </div>
                    <div className="font-mono text-text-primary font-bold mt-1">
                      &euro;4,99
                      <span className="text-xs font-normal text-text-muted">
                        /mese
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-small font-medium text-text-secondary border-b border-border-light w-1/5">
                    <div>Azienda</div>
                    <div className="font-mono text-text-primary font-bold mt-1">
                      &euro;29
                      <span className="text-xs font-normal text-text-muted">
                        /mese
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={
                      i % 2 === 0 ? "bg-bg-primary" : "bg-bg-secondary/50"
                    }
                  >
                    <td className="py-3.5 px-4 text-small text-text-primary border-b border-border-light">
                      {feature.name}
                    </td>
                    <td className="py-3.5 px-4 text-center border-b border-border-light">
                      <FeatureCell value={feature.gratis} />
                    </td>
                    <td className="py-3.5 px-4 text-center border-l border-r border-accent-primary/20 border-b border-border-light bg-accent-primary/[0.02]">
                      <FeatureCell value={feature.personale} />
                    </td>
                    <td className="py-3.5 px-4 text-center border-b border-border-light">
                      <FeatureCell value={feature.azienda} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/registrati">
                Inizia prova gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/tools/calcola-risparmio">
                Prova il quiz gratis
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* ---- FAQ ---- */}
      <section className="bg-bg-secondary py-20">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Domande sui prezzi
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion items={PRICING_FAQ} />
          </div>

          {/* FAQ Schema.org */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: PRICING_FAQ.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer,
                  },
                })),
              }),
            }}
          />
        </Container>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="bg-bg-primary py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary">
              Il risparmio che trovi paga l&apos;abbonamento
            </h2>
            <p className="mt-4 text-body text-text-secondary">
              In media i nostri utenti risparmiano oltre &euro;2.000 l&apos;anno.
              Il piano Personale costa meno di un caffe al mese.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/registrati">
                  Inizia ora &mdash; 7 giorni gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
