import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 20 req/min per IP
    const ip = getClientIp(req);
    const rl = checkRateLimit(`quiz:${ip}`, { limit: 20, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Troppi tentativi. Riprova tra poco." },
        { status: 429 }
      );
    }

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
