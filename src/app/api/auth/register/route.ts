import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, referralCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La password deve avere almeno 8 caratteri" },
        { status: 400 }
      );
    }

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
