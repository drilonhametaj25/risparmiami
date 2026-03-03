import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Impostazioni" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div>
      <h1 className="font-heading text-2xl mb-6">Impostazioni</h1>
      <SettingsForm user={{
        name: session.user.name || "",
        email: session.user.email || "",
      }} />
    </div>
  );
}
