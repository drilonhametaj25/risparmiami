import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchesForUser } from "@/lib/rule-engine";
import { z } from "zod";

const profileUpdateSchema = z.object({
  bankName: z.string().max(100).optional(),
  accountType: z.string().max(50).optional(),
  accountAgeYears: z.string().max(20).optional(),
  estimatedBankCost: z.string().max(20).optional(),
  iseeRange: z.string().max(20).optional(),
  electricityProvider: z.string().max(100).optional(),
  gasProvider: z.string().max(100).optional(),
}).strict();

export async function GET() {
  try {
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
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento del profilo" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (Object.keys(data).length > 0) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data,
      });

      // Re-compute matches with updated profile
      await computeMatchesForUser(session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del profilo" },
      { status: 500 }
    );
  }
}
