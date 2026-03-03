import type { Metadata } from "next";

import { Hero } from "@/components/marketing/hero";
import { SocialProof } from "@/components/marketing/social-proof";
import { SavingsAreas } from "@/components/marketing/savings-areas";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MiniQuizEmbed } from "@/components/marketing/mini-quiz-embed";
import { PdfGuideSection } from "@/components/marketing/pdf-guide-section";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Testimonials } from "@/components/marketing/testimonials";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FinalCta } from "@/components/marketing/final-cta";

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                       */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "RisparmiaMi — Scopri quanto stai perdendo ogni anno",
  description:
    "Detrazioni non sfruttate, bonus mai richiesti, bollette troppo care. " +
    "Gli italiani perdono in media 2.000-3.000 euro l'anno. " +
    "Scopri il tuo risparmio personalizzato in 2 minuti con RisparmiaMi.",
  alternates: { canonical: "https://risparmiami.pro" },
  openGraph: {
    title: "RisparmiaMi — Scopri quanto stai perdendo ogni anno",
    description:
      "Detrazioni non sfruttate, bonus mai richiesti, bollette troppo care. " +
      "Scopri il tuo risparmio personalizzato in 2 minuti.",
    url: "https://risparmiami.pro",
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  JSON-LD Structured Data                                            */
/* ------------------------------------------------------------------ */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RisparmiaMi",
  url: "https://risparmiami.pro",
  logo: "https://risparmiami.pro/logo.png",
  sameAs: [],
};

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */

export default function MarketingPage() {
  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />
      <SocialProof />
      <SavingsAreas />
      <HowItWorks />
      <MiniQuizEmbed />
      <PdfGuideSection />
      <PricingTable />
      <Testimonials />
      <FaqAccordion />
      <FinalCta />
    </>
  );
}
