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
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const data = createSchema.parse(body);

  const subscription = await prisma.userSubscription.create({
    data: {
      userId: session.user.id,
      name: data.name,
      category: data.category,
      monthlyCost: data.monthlyCost,
    },
  });

  return NextResponse.json({
    ...subscription,
    monthlyCost: Number(subscription.monthlyCost),
  });
}
