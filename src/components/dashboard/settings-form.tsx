"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";
import { User, Bell, Shield, Trash2, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

interface SettingsFormProps {
  user: {
    name: string;
    email: string;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [name, setName] = useState(user.name);

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
          <Button size="sm">Salva modifiche</Button>
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
            { label: "Email aggiornamenti regole", desc: "Ricevi notifiche quando cambiano le regole che ti riguardano" },
            { label: "Report mensile", desc: "Riepilogo mensile del tuo risparmio" },
            { label: "Alert scadenze", desc: "Promemoria prima delle scadenze importanti" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-accent-primary" />
            </div>
          ))}
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
        <Button variant="secondary" size="sm">
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
          Eliminare il tuo account &egrave; un&apos;azione irreversibile. Tutti i tuoi dati verranno cancellati permanentemente.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" size="sm">
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
      </Card>
    </div>
  );
}
