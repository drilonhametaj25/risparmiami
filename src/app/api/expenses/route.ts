import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  category: z.enum(["electricity", "gas", "water", "internet", "phone", "transport", "school", "medical", "daycare", "bank_canone", "bank_commissioni", "bank_bollo", "bank_carta"]),
  description: z.string().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  amount: z.number().min(0),
  provider: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (category) where.category = category;

    const expenses = await prisma.userExpense.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(
      expenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
      }))
    );
  } catch (error) {
    console.error("Expenses GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle spese" },
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

    const expense = await prisma.userExpense.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({
      ...expense,
      amount: Number(expense.amount),
    });
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio della spesa" },
      { status: 500 }
    );
  }
}
