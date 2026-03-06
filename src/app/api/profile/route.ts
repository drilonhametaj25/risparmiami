import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchesForUser } from "@/lib/rule-engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await req.json();

  // Only allow specific fields to be updated
  const allowedFields = [
    "bankName", "accountType", "accountAgeYears", "estimatedBankCost",
    "iseeRange", "electricityProvider", "gasProvider",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length > 0) {
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data,
    });

    // Re-compute matches with updated profile
    await computeMatchesForUser(session.user.id);
  }

  return NextResponse.json({ success: true });
}
