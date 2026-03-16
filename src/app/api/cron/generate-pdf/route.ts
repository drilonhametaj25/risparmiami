import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";

const LOCK_FILE = path.join(os.tmpdir(), "cron-generate-pdf.lock");
const LOCK_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function acquireLock(): boolean {
  try {
    // Check for stale lock
    try {
      const stat = fs.statSync(LOCK_FILE);
      if (Date.now() - stat.mtimeMs > LOCK_MAX_AGE_MS) {
        fs.unlinkSync(LOCK_FILE);
      }
    } catch { /* lock doesn't exist, good */ }

    // Atomic create — fails if file already exists
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: "wx" });
    return true;
  } catch {
    return false;
  }
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch { /* already removed */ }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!acquireLock()) {
    return NextResponse.json({ error: "Already running" }, { status: 409 });
  }

  try {
    // Call the generate endpoint internally
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/pdf/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Cron PDF generation error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  } finally {
    releaseLock();
  }
}
