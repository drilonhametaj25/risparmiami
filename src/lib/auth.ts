import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
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
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: { rejectUnauthorized: false },
      },
      from: process.env.EMAIL_FROM || "RisparmiaMi <info@drilonhametaj.it>",
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
