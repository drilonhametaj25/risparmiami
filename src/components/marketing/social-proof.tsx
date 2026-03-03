import { SectionWrapper } from "@/components/shared/section-wrapper";
import { AnimatedSection } from "@/components/shared/animated-section";
import { SavingsCounter } from "./savings-counter";

function SocialProof() {
  return (
    <SectionWrapper variant="muted" noPadding className="py-10">
      <AnimatedSection>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-text-primary">
              <SavingsCounter target={2.4} prefix="€" suffix="M" decimals={1} />
            </p>
            <p className="text-small text-text-secondary mt-1">di risparmi individuati</p>
          </div>
          <div className="hidden md:block w-px h-10 bg-border-light" />
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-text-primary">
              <SavingsCounter target={12000} suffix="+" />
            </p>
            <p className="text-small text-text-secondary mt-1">utenti</p>
          </div>
          <div className="hidden md:block w-px h-10 bg-border-light" />
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-text-primary">
              <SavingsCounter target={150} suffix="+" />
            </p>
            <p className="text-small text-text-secondary mt-1">regole aggiornate</p>
          </div>
        </div>
        <p className="text-center text-xs text-text-muted mt-6">
          Dati da fonti ufficiali: Agenzia delle Entrate &middot; INPS &middot; ARERA &middot; Banca d&apos;Italia
        </p>
      </AnimatedSection>
    </SectionWrapper>
  );
}

export { SocialProof };
