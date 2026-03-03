import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";

function FinalCta() {
  return (
    <SectionWrapper variant="dark" className="py-24">
      <AnimatedSection>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl text-white">
            Non perdere un altro euro.
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Scopri il tuo risparmio in 2 minuti.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/tools/calcola-risparmio">
                Inizia ora &mdash; e gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}

export { FinalCta };
