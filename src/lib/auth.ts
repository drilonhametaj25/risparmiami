import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      currentPlan: string;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || "RisparmiaMi <noreply@risparmiami.pro>",
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding/personale",
    verifyRequest: "/login/verifica-email",
  },
  callbacks: {
    async session({ session, user }) {
      // Fetch extra fields
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, currentPlan: true, onboardingCompleted: true },
      });
      if (dbUser) {
        session.user.id = user.id;
        session.user.role = dbUser.role;
        session.user.currentPlan = dbUser.currentPlan;
        session.user.onboardingCompleted = dbUser.onboardingCompleted;
      }
      return session;
    },
  },
});
