"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { signOut } from "next-auth/react";
import { User, Bell, Trash2, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

interface SettingsFormProps {
  user: {
    name: string;
    email: string;
    notifyRuleUpdates: boolean;
    notifyMonthlyReport: boolean;
    notifyDeadlines: boolean;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    notifyRuleUpdates: user.notifyRuleUpdates,
    notifyMonthlyReport: user.notifyMonthlyReport,
    notifyDeadlines: user.notifyDeadlines,
  });
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...notifications }),
      });
      if (!res.ok) throw new Error();
      showToast("Impostazioni salvate");
    } catch {
      showToast("Errore nel salvataggio", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `risparmiami-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Dati esportati");
    } catch {
      showToast("Errore nell'esportazione", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      signOut({ callbackUrl: "/" });
    } catch {
      showToast("Errore nell'eliminazione dell'account", "error");
      setDeleting(false);
    }
  }

  function handleNotificationChange(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-text-secondary" />
          <h2 className="font-medium text-lg">Profilo</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Il tuo nome" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <Input value={user.email} disabled className="opacity-60" />
          </div>
          <Button size="sm" onClick={handleSave} loading={saving}>
            Salva modifiche
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-border-light">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/onboarding/personale">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aggiorna il tuo profilo finanziario
            </Link>
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-text-secondary" />
          <h2 className="font-medium text-lg">Notifiche</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: "notifyRuleUpdates" as const, label: "Email aggiornamenti regole", desc: "Ricevi notifiche quando cambiano le regole che ti riguardano" },
            { key: "notifyMonthlyReport" as const, label: "Report mensile", desc: "Riepilogo mensile del tuo risparmio" },
            { key: "notifyDeadlines" as const, label: "Alert scadenze", desc: "Promemoria prima delle scadenze importanti" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() => handleNotificationChange(item.key)}
                className="h-4 w-4 accent-accent-primary"
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={handleSave} loading={saving}>
            Salva preferenze
          </Button>
        </div>
      </Card>

      {/* Data Export */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Download className="h-5 w-5 text-text-secondary" />
          <h2 className="font-medium text-lg">I tuoi dati</h2>
        </div>
        <p className="text-sm text-text-secondary mb-3">
          Puoi scaricare una copia di tutti i tuoi dati in qualsiasi momento (GDPR Art. 20).
        </p>
        <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting}>
          <Download className="h-4 w-4 mr-2" />
          Esporta i miei dati
        </Button>
      </Card>

      {/* Danger zone */}
      <Card padding="lg" className="border-accent-danger/20">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-accent-danger" />
          <h2 className="font-medium text-lg text-accent-danger">Zona pericolosa</h2>
        </div>
        <p className="text-sm text-text-secondary mb-3">
          Eliminare il tuo account è un&apos;azione irreversibile. Tutti i tuoi dati verranno cancellati permanentemente.
        </p>
        {!showDeleteConfirm ? (
          <div className="flex gap-3">
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Elimina account
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Esci dall&apos;account
            </Button>
          </div>
        ) : (
          <div className="bg-accent-danger/5 border border-accent-danger/20 rounded-md p-4">
            <p className="text-sm font-medium text-accent-danger mb-3">
              Sei sicuro? Questa azione non può essere annullata.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
                Sì, elimina tutto
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Annulla
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
