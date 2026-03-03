import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePdfBuffer } from "@/lib/pdf/generate-guide";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  // Verify authorization (CRON_SECRET header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all active rules
    const rules = await prisma.rule.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    if (rules.length === 0) {
      return NextResponse.json(
        { error: "No active rules found" },
        { status: 404 }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePdfBuffer(rules);

    // Save to public/generated-pdfs/
    const pdfDir = path.join(process.cwd(), "public", "generated-pdfs");
    await fs.mkdir(pdfDir, { recursive: true });

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `guida-risparmio-${timestamp}.pdf`;
    const filepath = path.join(pdfDir, filename);

    await fs.writeFile(filepath, pdfBuffer);

    // Also save as "latest" for easy reference
    const latestPath = path.join(pdfDir, "guida-risparmio-latest.pdf");
    await fs.writeFile(latestPath, pdfBuffer);

    return NextResponse.json({
      success: true,
      filename,
      rulesCount: rules.length,
      size: pdfBuffer.length,
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
