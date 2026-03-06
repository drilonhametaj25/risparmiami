"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, AlertTriangle, Download } from "lucide-react";

interface Deadline {
  id: string;
  name: string;
  category: string;
  description: string;
  deadline: string;
  officialUrl: string | null;
  estimatedSaving: number;
}

interface DeadlineCalendarProps {
  deadlines: Deadline[];
}

function generateICS(deadline: Deadline): string {
  const d = new Date(deadline.deadline);
  const dateStr = d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RisparmiaMi//Scadenza//IT",
    "BEGIN:VEVENT",
    `DTSTART:${dateStr}`,
    `DTEND:${dateStr}`,
    `SUMMARY:Scadenza: ${deadline.name}`,
    `DESCRIPTION:${deadline.description}\\nRisparmio stimato: \\u20AC${deadline.estimatedSaving}`,
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Scadenza tra 7 giorni: ${deadline.name}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:Scadenza domani: ${deadline.name}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(deadline: Deadline) {
  const ics = generateICS(deadline);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scadenza-${deadline.name.toLowerCase().replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DeadlineCalendar({ deadlines }: DeadlineCalendarProps) {
  if (deadlines.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <Calendar className="h-8 w-8 text-text-muted mx-auto mb-2" />
        <p className="text-text-secondary">Nessuna scadenza in programma.</p>
        <p className="text-sm text-text-muted mt-1">
          Le scadenze delle tue opportunità appariranno qui.
        </p>
      </Card>
    );
  }

  const now = new Date();

  // Group by month
  const grouped: Record<string, Deadline[]> = {};
  for (const d of deadlines) {
    const date = new Date(d.deadline);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  }

  const monthNames = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([monthKey, items]) => {
        const [year, month] = monthKey.split("-").map(Number);
        return (
          <div key={monthKey}>
            <h3 className="font-heading text-lg mb-3">
              {monthNames[month - 1]} {year}
            </h3>
            <div className="space-y-3">
              {items.map((item) => {
                const deadline = new Date(item.deadline);
                const daysUntil = Math.ceil(
                  (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysUntil <= 7;
                const isPast = daysUntil < 0;

                return (
                  <Card
                    key={item.id}
                    padding="md"
                    className={
                      isUrgent && !isPast
                        ? "border-accent-warning"
                        : isPast
                          ? "opacity-60"
                          : ""
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[50px]">
                        <p className="text-2xl font-bold text-text-primary">
                          {deadline.getDate()}
                        </p>
                        <p className="text-xs text-text-muted uppercase">
                          {monthNames[deadline.getMonth()].slice(0, 3)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isUrgent && !isPast && (
                            <AlertTriangle className="h-4 w-4 text-accent-warning" />
                          )}
                          <span className="text-xs text-text-muted capitalize">
                            {item.category}
                          </span>
                          {isPast && (
                            <Badge variant="consiglio" className="text-xs">
                              Scaduta
                            </Badge>
                          )}
                          {isUrgent && !isPast && (
                            <Badge variant="probabile" className="text-xs">
                              {daysUntil} giorni
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-text-secondary">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="font-money text-sm font-bold text-accent-success">
                            +&euro;{item.estimatedSaving.toLocaleString("it-IT")}
                          </p>
                          <button
                            onClick={() => downloadICS(item)}
                            className="text-xs text-accent-primary hover:underline flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Aggiungi al calendario
                          </button>
                          {item.officialUrl && (
                            <a
                              href={item.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-accent-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Sito ufficiale
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
