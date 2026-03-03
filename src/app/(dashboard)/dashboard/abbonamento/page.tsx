import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionManager } from "@/components/dashboard/subscription-manager";

export const metadata: Metadata = {
  title: "Abbonamento",
};

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl mb-6">Il tuo abbonamento</h1>
      <SubscriptionManager
        currentPlan={session.user.currentPlan}
        subscription={subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        } : null}
      />
    </div>
  );
}
