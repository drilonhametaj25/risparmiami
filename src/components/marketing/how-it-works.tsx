import { MessageSquare, BarChart3, BadgeCheck } from "lucide-react";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

const STEPS = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Rispondi a 5 domande",
    description: "Un questionario rapido sulla tua situazione: lavoro, casa, famiglia, utenze.",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Ricevi il tuo report",
    description: "Il nostro motore analizza 150+ regole e ti mostra quanto puoi risparmiare.",
  },
  {
    icon: BadgeCheck,
    number: "03",
    title: "Agisci e risparmia",
    description: "Per ogni opportunità, ti diciamo esattamente cosa fare, step by step.",
  },
];

function HowItWorks() {
  return (
    <SectionWrapper variant="muted" id="come-funziona">
      <AnimatedSection>
        <div className="text-center mb-16">
          <h2 className="font-heading text-h1 text-text-primary">Come funziona</h2>
          <p className="mt-3 text-body text-text-secondary">Tre passi per non perdere un altro euro.</p>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-border-light" />

        {STEPS.map((step, i) => (
          <AnimatedSection key={step.number} delay={i * 0.15}>
            <div className="text-center relative">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border border-border-light shadow-sm mb-6 relative z-10">
                <step.icon className="h-10 w-10 text-accent-primary" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-mono text-accent-primary font-medium mb-2">
                {step.number}
              </div>
              <h3 className="font-heading text-h3 text-text-primary">{step.title}</h3>
              <p className="mt-2 text-small text-text-secondary max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.5}>
        <p className="text-center text-small text-text-muted mt-10">
          Tempo medio: 2 minuti
        </p>
      </AnimatedSection>
    </SectionWrapper>
  );
}

export { HowItWorks };
