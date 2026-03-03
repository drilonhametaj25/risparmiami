import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (session.mode === "subscription" && userId) {
          const subscriptionId = session.subscription as string;
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const item = sub.items.data[0];

          await prisma.subscription.update({
            where: { userId },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: item?.price.id,
              plan: session.metadata?.planId || "personale",
              status: sub.status,
              currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
              currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { currentPlan: session.metadata?.planId || "personale" },
          });
        }

        if (session.mode === "payment") {
          const paymentIntentId = session.payment_intent as string;

          // Idempotency: skip if this payment was already processed
          const existingPurchase = await prisma.pdfPurchase.findFirst({
            where: { stripePaymentId: paymentIntentId },
          });
          if (!existingPurchase) {
            const purchase = await prisma.pdfPurchase.create({
              data: {
                email: session.customer_email || session.customer_details?.email || "",
                stripePaymentId: paymentIntentId,
                amount: (session.amount_total || 1900) / 100,
                ...(userId ? { userId } : {}),
                downloadUrl: "",
              },
            });

            await prisma.pdfPurchase.update({
              where: { id: purchase.id },
              data: {
                downloadUrl: `/api/pdf/download/${purchase.id}`,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const subItem = sub.items.data[0];

        const dbSub = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (dbSub) {
          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              status: sub.status,
              stripePriceId: subItem?.price.id,
              currentPeriodStart: subItem ? new Date(subItem.current_period_start * 1000) : null,
              currentPeriodEnd: subItem ? new Date(subItem.current_period_end * 1000) : null,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const dbSub = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (dbSub) {
          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: { status: "canceled", plan: "free" },
          });
          await prisma.user.update({
            where: { id: dbSub.userId },
            data: { currentPlan: "free" },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "past_due" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
