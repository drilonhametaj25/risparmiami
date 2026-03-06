"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Users, Share2 } from "lucide-react";

interface ReferralPanelProps {
  referralUrl: string;
  referralCode: string;
  referralCount: number;
}

export function ReferralPanel({ referralUrl, referralCode, referralCount }: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({
        title: "Scopri quanto stai perdendo ogni anno",
        text: "Usa RisparmiaMi per scoprire detrazioni, bonus e risparmi a cui hai diritto!",
        url: referralUrl,
      }).catch(() => {});
    } else {
      copyLink();
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="lg" className="text-center">
          <Users className="h-6 w-6 text-accent-primary mx-auto mb-2" />
          <p className="font-money text-2xl font-bold">{referralCount}</p>
          <p className="text-sm text-text-secondary">Amici invitati</p>
        </Card>
        <Card padding="lg" className="text-center">
          <Gift className="h-6 w-6 text-accent-success mx-auto mb-2" />
          <p className="font-money text-2xl font-bold">{referralCount}</p>
          <p className="text-sm text-text-secondary">Registrazioni</p>
        </Card>
      </div>

      {/* Share link */}
      <Card padding="lg">
        <h2 className="font-heading text-lg mb-3">Il tuo link di invito</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-light rounded-md text-text-secondary"
          />
          <Button size="sm" variant="secondary" onClick={copyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex gap-3">
          <Button onClick={shareLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Condividi
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const text = encodeURIComponent(`Scopri quanto stai perdendo ogni anno con RisparmiaMi! ${referralUrl}`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
          >
            WhatsApp
          </Button>
        </div>
      </Card>

      {/* How it works */}
      <Card padding="lg">
        <h2 className="font-heading text-lg mb-3">Come funziona</h2>
        <div className="space-y-3">
          {[
            { step: "1", text: "Condividi il tuo link con amici e famiglia" },
            { step: "2", text: "I tuoi amici si registrano tramite il link" },
            { step: "3", text: "Scoprono le loro opportunità di risparmio" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              <p className="text-sm text-text-secondary">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
