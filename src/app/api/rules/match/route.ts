import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeMatchesForUser, getMatchesForUser } from "@/lib/rule-engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const matches = await getMatchesForUser(session.user.id);
  return NextResponse.json({ matches });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const matches = await computeMatchesForUser(session.user.id);
  return NextResponse.json({ matches, recomputed: true });
}
