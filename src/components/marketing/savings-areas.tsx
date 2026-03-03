import { Receipt, Zap, Landmark, CreditCard, Plane, FileText, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

const AREAS = [
  {
    icon: Receipt,
    title: "Detrazioni Fiscali",
    saving: "€500-5.000/anno",
    fact: "Il 37% degli italiani non conosce le detrazioni a cui ha diritto",
  },
  {
    icon: Zap,
    title: "Bollette Luce e Gas",
    saving: "€100-400/anno",
    fact: "Il 40% paga più della media senza saperlo",
  },
  {
    icon: Landmark,
    title: "Costi Bancari",
    saving: "€50-200/anno",
    fact: "Il conto medio costa €90/anno — molte alternative sono gratis",
  },
  {
    icon: CreditCard,
    title: "Abbonamenti Inutili",
    saving: "€100-500/anno",
    fact: "L'italiano medio ha 3 abbonamenti che non usa",
  },
  {
    icon: Plane,
    title: "Rimborsi Trasporti",
    saving: "€250-600/rimborso",
    fact: "Solo il 5% dei passeggeri richiede i rimborsi dovuti",
  },
  {
    icon: FileText,
    title: "Errori ISEE",
    saving: "€500-3.000/anno",
    fact: "Un ISEE sbagliato può far perdere migliaia di euro in bonus",
  },
  {
    icon: Building2,
    title: "Incentivi Imprese",
    saving: "€5.000-50.000+",
    fact: "Il 60% delle PMI non conosce i crediti d'imposta disponibili",
  },
];

function SavingsAreas() {
  return (
    <SectionWrapper>
      <AnimatedSection>
        <div className="text-center mb-12">
          <h2 className="font-heading text-h1 text-text-primary">
            7 aree dove stai perdendo soldi
          </h2>
          <p className="mt-3 text-body text-text-secondary max-w-2xl mx-auto">
            Analizziamo la tua situazione su ogni fronte e ti diciamo esattamente quanto puoi recuperare.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AREAS.map((area, i) => (
          <AnimatedSection key={area.title} delay={i * 0.08}>
            <Card hover padding="lg" className="h-full">
              <area.icon className="h-8 w-8 text-accent-primary mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-h3 text-text-primary">{area.title}</h3>
              <p className="mt-1 font-mono text-sm text-accent-success font-medium">
                Risparmio medio: {area.saving}
              </p>
              <p className="mt-3 text-small text-text-secondary leading-relaxed">
                {area.fact}
              </p>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </SectionWrapper>
  );
}

export { SavingsAreas };
