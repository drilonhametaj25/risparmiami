import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

interface SharePageProps {
  params: { token: string };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const user = await prisma.user.findFirst({
    where: { shareToken: params.token },
    include: { matches: true },
  });

  if (!user) return { title: "Condivisione — RisparmiaMi" };

  const totalSavings = user.matches.reduce(
    (sum, m) => sum + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0
  );

  return {
    title: `Ho scoperto €${totalSavings.toLocaleString("it-IT")} di risparmi — RisparmiaMi`,
    description: `Un utente RisparmiaMi ha scoperto ${user.matches.length} opportunità di risparmio. Scopri anche tu quanto puoi risparmiare!`,
    openGraph: {
      title: `€${totalSavings.toLocaleString("it-IT")} di risparmi scoperti!`,
      description: `${user.matches.length} opportunità di risparmio trovate con RisparmiaMi. Scopri anche tu quanto puoi risparmiare!`,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const user = await prisma.user.findFirst({
    where: { shareToken: params.token },
    include: {
      matches: {
        include: { rule: { select: { category: true, name: true } } },
        where: { status: "pending" },
      },
    },
  });

  if (!user) notFound();

  const totalSavings = user.matches.reduce(
    (sum, m) => sum + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0
  );

  // Group by category
  const categoryTotals: Record<string, { count: number; total: number }> = {};
  for (const m of user.matches) {
    const cat = m.rule.category;
    if (!categoryTotals[cat]) categoryTotals[cat] = { count: 0, total: 0 };
    categoryTotals[cat].count++;
    categoryTotals[cat].total += m.estimatedSaving ? Number(m.estimatedSaving) : 0;
  }

  const categoryLabels: Record<string, string> = {
    detrazioni: "Detrazioni Fiscali",
    bollette: "Bollette",
    abbonamenti: "Abbonamenti",
    trasporti: "Trasporti",
    banca: "Banca",
    isee: "ISEE e Bonus",
    incentivi: "Incentivi",
    "bonus-inps": "Bonus INPS",
  };

  return (
    <section className="min-h-screen bg-bg-primary py-16">
      <Container size="narrow">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-accent-success" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-2">
            Un utente RisparmiaMi ha scoperto
          </h1>
          <p className="font-money text-5xl md:text-6xl font-bold text-accent-success mb-2">
            &euro;{totalSavings.toLocaleString("it-IT")}
          </p>
          <p className="text-text-secondary text-lg">
            di risparmi potenziali con {user.matches.length} opportunit&agrave;
          </p>
        </div>

        {/* Category breakdown */}
        <div className="grid gap-3 mb-8">
          {Object.entries(categoryTotals)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([cat, data]) => (
              <Card key={cat} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{categoryLabels[cat] || cat}</p>
                    <p className="text-sm text-text-muted">{data.count} opportunit&agrave;</p>
                  </div>
                  <p className="font-money font-bold text-accent-success">
                    +&euro;{data.total.toLocaleString("it-IT")}
                  </p>
                </div>
              </Card>
          ))}
        </div>

        {/* CTA */}
        <Card padding="lg" className="text-center bg-bg-secondary">
          <Shield className="h-8 w-8 text-accent-primary mx-auto mb-3" />
          <h2 className="font-heading text-xl mb-2">Scopri quanto puoi risparmiare tu</h2>
          <p className="text-text-secondary mb-5">
            Rispondi a 5 domande e scopri le tue opportunit&agrave; di risparmio personalizzate.
          </p>
          <Button size="lg" asChild>
            <Link href="/tools/calcola-risparmio">
              Calcola il tuo risparmio
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </Card>
      </Container>
    </section>
  );
}
