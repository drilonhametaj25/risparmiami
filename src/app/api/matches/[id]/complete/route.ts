import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { id } = await params;

    let actualSaving: number | undefined;
    try {
      const body = await req.json();
      actualSaving = body.actualSaving;
    } catch {
      // No body is fine - backward compatible
    }

    const match = await prisma.userMatch.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!match) {
      return NextResponse.json({ error: "Non trovato" }, { status: 404 });
    }

    await prisma.userMatch.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
        ...(actualSaving !== undefined ? { actualSaving } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Match complete error:", error);
    return NextResponse.json(
      { error: "Errore nel completamento dell'azione" },
      { status: 500 }
    );
  }
}
