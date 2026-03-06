import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("quiz_session")?.value;

  if (!sessionId) {
    return NextResponse.json({ answers: null });
  }

  const result = await prisma.quizResult.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });

  if (!result) {
    return NextResponse.json({ answers: null });
  }

  // Map quiz answers to onboarding field names
  const quizAnswers = result.answers as Record<string, string>;
  const mapped: Record<string, unknown> = {};

  // lavoro -> employmentType
  if (quizAnswers.lavoro) {
    const employmentMap: Record<string, string> = {
      dipendente: "dipendente",
      autonomo: "autonomo",
      pensionato: "pensionato",
      disoccupato: "disoccupato",
    };
    mapped.employmentType = employmentMap[quizAnswers.lavoro] || null;
  }

  // reddito -> incomeRange
  if (quizAnswers.reddito) {
    const incomeMap: Record<string, string> = {
      under15: "0-15000",
      "15_28": "15000-28000",
      "28_50": "28000-50000",
      "50_75": "50000-75000",
      over75: "75000+",
    };
    mapped.incomeRange = incomeMap[quizAnswers.reddito] || null;
  }

  // figli -> childrenCount
  if (quizAnswers.figli) {
    mapped.childrenCount =
      quizAnswers.figli === "3+" ? 3 : parseInt(quizAnswers.figli, 10);
  }

  // abitazione -> housingType + hasMortgage
  if (quizAnswers.abitazione) {
    const housingMap: Record<
      string,
      { housingType: string; hasMortgage?: boolean }
    > = {
      mutuo: { housingType: "proprietà", hasMortgage: true },
      proprieta: { housingType: "proprietà", hasMortgage: false },
      affitto: { housingType: "affitto" },
      altro: { housingType: "altro" },
    };
    const h = housingMap[quizAnswers.abitazione];
    if (h) {
      mapped.housingType = h.housingType;
      if (h.hasMortgage !== undefined) mapped.hasMortgage = h.hasMortgage;
    }
  }

  // bollette -> electricityBimonthly (approximate mapping)
  if (quizAnswers.bollette) {
    const billMap: Record<string, string> = {
      under100: "0-50",
      "100_200": "50-100",
      "200_350": "100-175",
      over350: "175+",
    };
    mapped.electricityBimonthly = billMap[quizAnswers.bollette] || null;
  }

  return NextResponse.json({ answers: mapped });
}
