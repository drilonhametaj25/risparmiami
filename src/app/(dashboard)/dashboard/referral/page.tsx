import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReferralPanel } from "@/components/dashboard/referral-panel";

export const metadata: Metadata = {
  title: "Invita amici",
};

export default async function ReferralPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });

  // Generate referral code if doesn't exist
  if (!user?.referralCode) {
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    user = await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: code },
      select: { referralCode: true },
    });
  }

  // Count referrals
  const referralCount = await prisma.user.count({
    where: { referredBy: session.user.id },
  });

  const referralUrl = `${process.env.NEXTAUTH_URL}/registrati?ref=${user.referralCode}`;

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Invita amici</h1>
      <p className="text-text-secondary text-sm mb-6">
        Condividi RisparmiaMi con amici e famiglia
      </p>
      <ReferralPanel
        referralUrl={referralUrl}
        referralCode={user.referralCode!}
        referralCount={referralCount}
      />
    </div>
  );
}
