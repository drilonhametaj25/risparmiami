import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["streaming", "music", "news", "fitness", "cloud", "gaming", "other"]),
  monthlyCost: z.number().min(0),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      subscriptions.map((s) => ({
        ...s,
        monthlyCost: Number(s.monthlyCost),
      }))
    );
  } catch (error) {
    console.error("Subscriptions GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento degli abbonamenti" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi" },
        { status: 400 }
      );
    }

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        category: parsed.data.category,
        monthlyCost: parsed.data.monthlyCost,
      },
    });

    return NextResponse.json({
      ...subscription,
      monthlyCost: Number(subscription.monthlyCost),
    });
  } catch (error) {
    console.error("Subscriptions POST error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio dell'abbonamento" },
      { status: 500 }
    );
  }
}
