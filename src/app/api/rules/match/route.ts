import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeMatchesForUser, getMatchesForUser } from "@/lib/rule-engine";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const matches = await getMatchesForUser(session.user.id);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Rules match GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle opportunità" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const matches = await computeMatchesForUser(session.user.id);
    return NextResponse.json({ matches, recomputed: true });
  } catch (error) {
    console.error("Rules match POST error:", error);
    return NextResponse.json(
      { error: "Errore nel ricalcolo delle opportunità" },
      { status: 500 }
    );
  }
}
