"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BuyPdfButtonProps {
  label: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function BuyPdfButton({ label, size = "lg", showIcon = true }: BuyPdfButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pdf" }),
      });

      if (res.status === 401) {
        router.push("/login?callbackUrl=/guida-pdf");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("Checkout error:", data.error);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  }

  return (
    <Button size={size} onClick={handleBuy} loading={loading}>
      {label}
      {showIcon && <Download className="h-5 w-5 ml-2" />}
    </Button>
  );
}
