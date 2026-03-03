import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Download, Mail } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Acquisto Completato — RisparmiaMi",
  robots: { index: false },
};

export default async function GuidaPdfSuccessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/guida-pdf");
  }

  // Find the purchase by Stripe payment intent
  // The webhook creates PdfPurchase with stripePaymentId
  const purchase = await prisma.pdfPurchase.findFirst({
    where: {
      stripePaymentId: { not: "" },
    },
    orderBy: { createdAt: "desc" },
  });

  // If purchase found, look it up by the stripe session's payment intent
  // For now, find the most recent purchase (webhook should have created it)
  let purchaseId = purchase?.id;
  let remainingDownloads = purchase ? purchase.maxDownloads - purchase.downloadCount : 5;

  // Try to find purchase by Stripe session
  try {
    const { stripe } = await import("@/lib/stripe");
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paymentIntent = session.payment_intent as string;

    if (paymentIntent) {
      const exactPurchase = await prisma.pdfPurchase.findUnique({
        where: { stripePaymentId: paymentIntent },
      });
      if (exactPurchase) {
        purchaseId = exactPurchase.id;
        remainingDownloads = exactPurchase.maxDownloads - exactPurchase.downloadCount;
      }
    }
  } catch {
    // Stripe lookup failed, use fallback
  }

  return (
    <section className="section-padding bg-bg-primary min-h-screen">
      <Container>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 bg-accent-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-accent-success" />
          </div>

          <h1 className="font-heading text-h1 mb-3">Acquisto completato!</h1>
          <p className="text-text-secondary text-lg mb-8">
            Grazie per aver acquistato la Guida Definitiva al Risparmio.
          </p>

          <Card padding="lg" className="mb-8 text-left">
            <h2 className="font-heading text-lg mb-4">La tua guida e' pronta</h2>
            <p className="text-text-secondary text-sm mb-6">
              Clicca il pulsante qui sotto per scaricare il PDF. Puoi scaricarlo
              fino a {remainingDownloads} volte.
            </p>

            {purchaseId ? (
              <Button size="lg" className="w-full" asChild>
                <Link href={`/api/pdf/download/${purchaseId}`}>
                  Scarica la Guida PDF
                  <Download className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <div className="bg-bg-secondary p-4 rounded-lg">
                <p className="text-sm text-text-muted">
                  Il tuo acquisto e' in fase di elaborazione. Ricarica la pagina tra
                  qualche secondo oppure controlla la tua email.
                </p>
              </div>
            )}
          </Card>

          <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
            <Mail className="h-4 w-4" />
            <span>
              Problemi? Scrivici a{" "}
              <a href="mailto:supporto@risparmiami.pro" className="text-accent-primary underline">
                supporto@risparmiami.pro
              </a>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
