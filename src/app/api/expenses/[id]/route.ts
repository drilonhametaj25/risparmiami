import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { id } = await params;

  const expense = await prisma.userExpense.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!expense) {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }

  await prisma.userExpense.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
