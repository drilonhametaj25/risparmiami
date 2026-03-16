import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 req/min per IP
    const ip = getClientIp(req);
    const rl = checkRateLimit(`register:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Troppi tentativi. Riprova tra poco." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Dati non validi";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, name, referralCode } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Esiste già un account con questa email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        hashedPassword,
      },
    });

    // Link referral if a valid referral code was provided
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode },
      });
      if (referrer) {
        await prisma.user.update({
          where: { id: newUser.id },
          data: { referredBy: referrer.id },
        });
      }
    }

    // Mark quiz result as converted if a quiz_session cookie exists
    const quizSessionId = req.cookies.get("quiz_session")?.value;
    if (quizSessionId) {
      await prisma.quizResult.updateMany({
        where: { sessionId: quizSessionId },
        data: { convertedToUser: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione" },
      { status: 500 }
    );
  }
}
