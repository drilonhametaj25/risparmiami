import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const purchase = await prisma.pdfPurchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Ownership check — if purchase has a userId, verify the requester owns it
    const session = await auth();
    if (purchase.userId && (!session?.user?.id || session.user.id !== purchase.userId)) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    if (purchase.downloadCount >= purchase.maxDownloads) {
      return NextResponse.json(
        {
          error:
            "Download limit reached. Contact supporto@risparmiami.pro",
        },
        { status: 403 }
      );
    }

    const pdfPath = path.join(
      process.cwd(),
      "public",
      "generated-pdfs",
      "guida-risparmio-latest.pdf"
    );

    try {
      await fs.access(pdfPath);
    } catch {
      return NextResponse.json(
        { error: "PDF not yet generated. Please try again later." },
        { status: 404 }
      );
    }

    const pdfBuffer = await fs.readFile(pdfPath);

    // Increment download count
    await prisma.pdfPurchase.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="Guida-Risparmio-RisparmiaMi-2026.pdf"',
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("PDF download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
