import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find matches with deadlines in the next 30 days
    const upcomingMatches = await prisma.userMatch.findMany({
      where: {
        status: "pending",
        rule: {
          deadline: { gte: now, lte: in30Days },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            notifyDeadlines: true,
          },
        },
        rule: { select: { name: true, category: true, deadline: true } },
      },
    });

    // Group by user
    const byUser: Record<
      string,
      {
        user: (typeof upcomingMatches)[0]["user"];
        matches: typeof upcomingMatches;
      }
    > = {};
    for (const m of upcomingMatches) {
      if (!m.user.notifyDeadlines) continue;
      if (!byUser[m.user.id])
        byUser[m.user.id] = { user: m.user, matches: [] };
      byUser[m.user.id].matches.push(m);
    }

    let sent = 0;

    for (const { user, matches } of Object.values(byUser)) {
      const urgent = matches.filter(
        (m) => new Date(m.rule.deadline!) <= in7Days
      );
      if (urgent.length === 0) continue; // Only send for 7-day deadlines

      const deadlineList = urgent
        .map((m) => {
          const d = new Date(m.rule.deadline!);
          const days = Math.ceil(
            (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return `<li><strong>${m.rule.name}</strong> &mdash; scade tra ${days} giorn${days === 1 ? "o" : "i"} (${d.toLocaleDateString("it-IT")})</li>`;
        })
        .join("");

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; font-size: 24px;">Scadenze imminenti</h1>
        <p style="color: #4a4a4a; line-height: 1.6;">
          Ciao${user.name ? ` ${user.name}` : ""}, hai <strong>${urgent.length} scadenz${urgent.length === 1 ? "a" : "e"}</strong> nei prossimi 7 giorni:
        </p>
        <ul style="color: #4a4a4a; line-height: 1.8;">${deadlineList}</ul>
        <p style="color: #4a4a4a;">Non perdere queste opportunit&agrave; di risparmio!</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/scadenze" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Vedi scadenze
        </a>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #999;">Gestisci notifiche</a>
        </p>
      </div>
    `;

      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `${urgent.length} scadenz${urgent.length === 1 ? "a" : "e"} nei prossimi 7 giorni`,
          html,
        });
        sent++;
      }
    }

    return NextResponse.json({
      sent,
      usersChecked: Object.keys(byUser).length,
    });
  } catch (error) {
    console.error("Deadline alerts cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
