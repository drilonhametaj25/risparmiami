import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
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
}
