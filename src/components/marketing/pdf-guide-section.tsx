import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

const FEATURES = [
  "Checklist detrazioni complete",
  "Template lettere reclamo",
  "Guide risparmio bollette",
  "Aggiornamenti per 12 mesi",
];

function PdfGuideSection() {
  return (
    <SectionWrapper>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* PDF Mockup */}
        <AnimatedSection>
          <div className="flex justify-center">
            <div className="relative">
              {/* Shadow/depth */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 bg-accent-primary/10 rounded-lg" />
              {/* Main "book" */}
              <div className="relative bg-white rounded-lg shadow-lg border border-border-light p-8 w-64 h-80 flex flex-col items-center justify-center">
                <div className="w-12 h-1 bg-accent-primary rounded-full mb-4" />
                <p className="font-heading text-lg text-text-primary text-center">
                  La Guida Definitiva al Risparmio
                </p>
                <p className="text-xs text-text-muted mt-2">80+ pagine</p>
                <div className="mt-6 space-y-1.5 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1.5 bg-bg-secondary rounded-full" style={{ width: `${90 - i * 12}%` }} />
                  ))}
                </div>
                <p className="mt-auto text-[10px] text-text-muted font-mono">risparmiami.pro</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Content */}
        <AnimatedSection delay={0.15}>
          <div>
            <h2 className="font-heading text-h1 text-text-primary">
              La Guida Definitiva al Risparmio
            </h2>
            <p className="mt-3 text-body text-text-secondary">
              80+ pagine, 100+ consigli pratici, template pronti all&apos;uso. Tutto quello che devi sapere per non perdere un euro.
            </p>

            <ul className="mt-6 space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-accent-success flex-shrink-0" />
                  <span className="text-body text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-3xl font-mono font-bold text-text-primary">€19</span>
              <span className="text-lg font-mono text-text-muted line-through">€29</span>
              <span className="text-xs text-accent-primary font-medium bg-accent-primary/10 px-2 py-0.5 rounded-full">
                Offerta lancio
              </span>
            </div>

            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href="/guida-pdf">Acquista la guida</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </SectionWrapper>
  );
}

export { PdfGuideSection };
