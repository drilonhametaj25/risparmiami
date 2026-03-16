import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Rate limit: 3 req/min per user
    const rl = checkRateLimit(`delete-account:${session.user.id}`, { limit: 3, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Troppi tentativi. Riprova tra poco." },
        { status: 429 }
      );
    }

    const userId = session.user.id;

    // Cancel Stripe subscription if exists
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });
      if (subscription?.stripeSubscriptionId) {
        await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId);
      }
    } catch (e) {
      console.error("Error canceling Stripe subscription:", e);
    }

    // Delete user (cascades to all related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'account" },
      { status: 500 }
    );
  }
}
