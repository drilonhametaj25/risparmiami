import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ToastProvider } from "@/components/ui/toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.onboardingCompleted) {
    redirect("/onboarding/personale");
  }

  return (
    <DashboardShell user={session.user}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </DashboardShell>
  );
}
