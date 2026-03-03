import { Card } from "@/components/ui/card";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

const TESTIMONIALS = [
  {
    name: "Marco R.",
    location: "34 anni, Firenze",
    quote: "Non avevo idea di avere diritto alla detrazione affitto. Con RisparmiaMi ho scoperto €1.840 di detrazioni che non sfruttavo.",
    saving: "€1.840",
    initials: "MR",
  },
  {
    name: "Giulia T.",
    location: "29 anni, Milano",
    quote: "Ho cambiato fornitore luce dopo il confronto e cancellato 3 abbonamenti che non usavo. In un'ora ho risparmiato €480 l'anno.",
    saving: "€480",
    initials: "GT",
  },
  {
    name: "Alessandro M.",
    location: "42 anni, Roma",
    quote: "Come libero professionista, non sapevo dei crediti d'imposta per la formazione. Il mio commercialista non me l'aveva detto.",
    saving: "€3.200",
    initials: "AM",
  },
];

function Testimonials() {
  return (
    <SectionWrapper variant="muted">
      <AnimatedSection>
        <div className="text-center mb-12">
          <h2 className="font-heading text-h1 text-text-primary">
            Storie di risparmio
          </h2>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <AnimatedSection key={t.name} delay={i * 0.1}>
            <Card padding="lg" className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-accent-primary">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.location}</p>
                </div>
              </div>
              <p className="text-body text-text-secondary italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-border-light">
                <p className="text-sm text-text-muted">Risparmio trovato</p>
                <p className="text-xl font-mono font-bold text-accent-success">{t.saving}</p>
              </div>
            </Card>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.4}>
        <p className="text-center text-xs text-text-muted mt-8">
          Casi illustrativi basati su scenari reali
        </p>
      </AnimatedSection>
    </SectionWrapper>
  );
}

export { Testimonials };
