import { Accordion } from "@/components/ui/accordion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

const FAQ_ITEMS = [
  {
    id: "1",
    question: "RisparmiaMi sostituisce il commercialista?",
    answer: "No. RisparmiaMi ti aiuta a scoprire opportunita di risparmio che potresti non conoscere, ma non fornisce consulenza fiscale personalizzata. Ti consigliamo sempre di verificare con il tuo commercialista o CAF prima di agire.",
  },
  {
    id: "2",
    question: "Come fate a essere precisi?",
    answer: "Le nostre regole sono basate su fonti ufficiali: Agenzia delle Entrate, INPS, ARERA, Banca d'Italia. Ogni regola ha un livello di certezza (certo, probabile, consiglio) e viene aggiornata regolarmente.",
  },
  {
    id: "3",
    question: "I miei dati sono al sicuro?",
    answer: "Assolutamente. Non chiediamo mai dati sensibili come codice fiscale o coordinate bancarie. I dati del profilo sono criptati e conservati su server europei. Rispettiamo il GDPR al 100%.",
  },
  {
    id: "4",
    question: "Posso cancellare quando voglio?",
    answer: "Certo. Puoi cancellare il tuo abbonamento in qualsiasi momento dalla dashboard. Nessun vincolo, nessuna penale. Continuerai ad avere accesso fino alla fine del periodo pagato.",
  },
  {
    id: "5",
    question: "Devo avere competenze fiscali?",
    answer: "No. RisparmiaMi e progettato per essere comprensibile da tutti. Per ogni opportunita di risparmio, forniamo istruzioni passo-passo in linguaggio semplice.",
  },
  {
    id: "6",
    question: "Quanto tempo ci vuole?",
    answer: "Il questionario iniziale richiede circa 2 minuti. Dopo, ricevi subito il tuo report con le azioni da compiere. Ogni azione ha istruzioni chiare su cosa fare e quanto tempo serve.",
  },
  {
    id: "7",
    question: "Le informazioni sono aggiornate?",
    answer: "Si. Il nostro sistema monitora automaticamente le fonti ufficiali (leggi, decreti, circolari) e aggiorna le regole ogni settimana. Ricevi notifiche quando ci sono novita rilevanti per te.",
  },
  {
    id: "8",
    question: "Posso usarlo come azienda?",
    answer: "Si. Il piano Azienda include incentivi per imprese, crediti d'imposta, agevolazioni sulle assunzioni e un calendario fiscale personalizzato. Ideale per PMI e professionisti.",
  },
];

function FaqAccordion() {
  return (
    <SectionWrapper>
      <AnimatedSection>
        <div className="text-center mb-12">
          <h2 className="font-heading text-h1 text-text-primary">
            Domande frequenti
          </h2>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <div className="max-w-3xl mx-auto">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </AnimatedSection>

      {/* FAQ Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
    </SectionWrapper>
  );
}

export { FaqAccordion };
