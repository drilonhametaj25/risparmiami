import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, estimatedMin, estimatedMax } = body;

    if (!answers || estimatedMin == null || estimatedMax == null) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();

    await prisma.quizResult.create({
      data: {
        sessionId,
        answers,
        estimatedMin,
        estimatedMax,
      },
    });

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Quiz save error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio" },
      { status: 500 }
    );
  }
}
