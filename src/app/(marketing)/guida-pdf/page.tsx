import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, BookOpen, Download, Shield, Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guida PDF al Risparmio — RisparmiaMi",
  description: "La guida definitiva per risparmiare in Italia. 80+ pagine di consigli pratici, detrazioni, bonus e strategie per non perdere neanche un euro.",
};

export default function GuidaPdfPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding bg-bg-primary">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent-primary font-medium text-sm mb-3">GUIDA COMPLETA 2026</p>
              <h1 className="font-heading text-display leading-tight mb-4">
                La Guida Definitiva al Risparmio in Italia
              </h1>
              <p className="text-text-secondary text-lg mb-6">
                80+ pagine di consigli pratici, detrazioni fiscali, bonus statali e strategie
                concrete per risparmiare fino a &euro;3.000 all&apos;anno.
              </p>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-money text-4xl font-bold">&euro;19</span>
                <span className="text-text-muted line-through font-money">&euro;39</span>
                <span className="text-accent-success text-sm font-medium">-51%</span>
              </div>
              <Button size="lg" asChild>
                <Link href="/api/stripe/checkout?planId=pdf">
                  Acquista ora &mdash; &euro;19
                  <Download className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-text-muted mt-3">Download immediato &bull; Pagamento sicuro &bull; Soddisfatto o rimborsato</p>
            </div>

            {/* PDF Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-80 bg-white rounded-lg shadow-lg border border-border-light transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-accent-primary" />
                    </div>
                    <h3 className="font-heading text-lg mb-2">Guida al Risparmio</h3>
                    <p className="text-xs text-text-muted">Edizione 2026</p>
                    <div className="mt-6 space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-2 bg-bg-secondary rounded-full" style={{ width: `${100 - i * 12}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-64 h-80 bg-bg-secondary rounded-lg -z-10 transform -rotate-3" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* What's inside */}
      <section className="section-padding bg-bg-secondary">
        <Container>
          <h2 className="font-heading text-h2 text-center mb-10">Cosa troverai nella guida</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Detrazioni Fiscali", desc: "Tutte le detrazioni 2026 con esempi pratici e calcoli" },
              { title: "Bonus e Agevolazioni", desc: "Elenco completo dei bonus INPS e come richiederli" },
              { title: "Bollette e Utenze", desc: "Come confrontare, scegliere e risparmiare su luce e gas" },
              { title: "Conti e Banca", desc: "Guida al cambio conto, surroga mutuo e investimenti" },
              { title: "ISEE e DSU", desc: "Come compilare l'ISEE senza errori e massimizzare i benefici" },
              { title: "Checklist Operative", desc: "Checklist pronte all'uso per ogni area di risparmio" },
            ].map((item) => (
              <Card key={item.title} padding="lg">
                <h3 className="font-heading text-lg mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Guarantees */}
      <section className="section-padding bg-bg-primary">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="h-12 w-12 text-accent-success mx-auto mb-4" />
            <h2 className="font-heading text-h2 mb-4">Garanzia soddisfatto o rimborsato</h2>
            <p className="text-text-secondary mb-8">
              Se la guida non ti &egrave; utile, ti rimborsiamo entro 30 giorni. Nessuna domanda.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "Aggiornata al 2026",
                "80+ pagine",
                "7 capitoli",
                "Checklist operative",
                "Download immediato",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent-success" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-bg-dark text-white">
        <Container>
          <div className="text-center">
            <h2 className="font-heading text-h2 mb-4">Non perdere altro tempo (e soldi)</h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Ogni mese che passa senza agire sono soldi che perdi. Inizia oggi.
            </p>
            <Button size="lg" asChild>
              <Link href="/api/stripe/checkout?planId=pdf">
                Scarica la guida &mdash; &euro;19
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
