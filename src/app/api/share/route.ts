import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Rate limit: 10 req/min per user
    if (session?.user?.id) {
      const rl = checkRateLimit(`share:${session.user.id}`, { limit: 10, windowSeconds: 60 });
      if (!rl.success) {
        return NextResponse.json(
          { error: "Troppi tentativi. Riprova tra poco." },
          { status: 429 }
        );
      }
    }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Check if user already has a share token
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { shareToken: true },
    });

    if (!user?.shareToken) {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { shareToken: token },
        select: { shareToken: true },
      });
    }

    const shareUrl = `${process.env.NEXTAUTH_URL}/share/${user.shareToken}`;
    return NextResponse.json({ url: shareUrl, token: user.shareToken });
  } catch (error) {
    console.error("Share token error:", error);
    return NextResponse.json(
      { error: "Errore nella generazione del link" },
      { status: 500 }
    );
  }
}
