import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { plans, type PlanId } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, billingPeriod = "monthly" } = body as {
      planId: PlanId;
      billingPeriod?: "monthly" | "yearly";
    };

    const plan = plans[planId];
    if (!plan) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
    }

    // Get or create Stripe customer (transactional to prevent race conditions)
    const { customerId } = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { userId: session.user.id },
      });

      if (subscription?.stripeCustomerId) {
        return { customerId: subscription.stripeCustomerId };
      }

      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });

      await tx.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          stripeCustomerId: customer.id,
          plan: "free",
          status: "inactive",
        },
        update: {
          stripeCustomerId: customer.id,
        },
      });

      return { customerId: customer.id };
    });

    const isSubscription = plan.mode === "subscription";
    const priceId = isSubscription
      ? billingPeriod === "yearly"
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly
      : plan.stripePriceIdOneTime;

    if (!priceId) {
      return NextResponse.json(
        { error: "Prezzo non configurato" },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/${isSubscription ? "dashboard" : "guida-pdf/successo"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/prezzi`,
      metadata: {
        userId: session.user.id,
        planId,
      },
      ...(isSubscription && plan.trialDays
        ? { subscription_data: { trial_period_days: plan.trialDays } }
        : {}),
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del checkout" },
      { status: 500 }
    );
  }
}
