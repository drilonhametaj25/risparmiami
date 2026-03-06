import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { plans, type PlanId } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, billingPeriod = "monthly", email: guestEmail } = body as {
      planId: PlanId;
      billingPeriod?: "monthly" | "yearly";
      email?: string;
    };

    const plan = plans[planId];
    if (!plan) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
    }

    const isSubscription = plan.mode === "subscription";
    const isPdf = planId === "pdf";

    // PDF can be purchased without auth; subscriptions require auth
    const session = await auth();
    if (!isPdf && !session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    let customerId: string | undefined;
    let userId: string | undefined;
    let customerEmail: string | undefined;

    if (session?.user?.id) {
      // Authenticated user — get or create Stripe customer
      userId = session.user.id;
      customerEmail = session.user.email!;

      const result = await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.findUnique({
          where: { userId: session.user.id },
        });

        if (subscription?.stripeCustomerId) {
          return { customerId: subscription.stripeCustomerId };
        }

        const customer = await getStripe().customers.create({
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

      customerId = result.customerId;
    } else if (isPdf && guestEmail) {
      // Guest PDF purchase — use email only
      customerEmail = guestEmail;
    } else {
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

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

    const checkoutSession = await getStripe().checkout.sessions.create({
      ...(customerId ? { customer: customerId } : { customer_email: customerEmail }),
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/${isSubscription ? "dashboard" : "guida-pdf/successo"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/${isPdf ? "guida-pdf" : "prezzi"}`,
      metadata: {
        ...(userId ? { userId } : {}),
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
