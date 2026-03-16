import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { id } = await params;

    const subscription = await prisma.userSubscription.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Non trovato" }, { status: 404 });
    }

    await prisma.userSubscription.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription DELETE error:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'abbonamento" },
      { status: 500 }
    );
  }
}
