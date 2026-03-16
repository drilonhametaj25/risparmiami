import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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

const smtpPort = Number(process.env.SMTP_PORT || 587);

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        ...(smtpPort !== 465 && { requireTLS: true }),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        ...(process.env.NODE_ENV !== "production" && { tls: { rejectUnauthorized: false } }),
      },
      from: process.env.EMAIL_FROM || "RisparmiaMi <info@drilonhametaj.it>",
    }),
    Credentials({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.hashedPassword) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding/personale",
    verifyRequest: "/login/verifica-email",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      // Cache user data in JWT (refreshed on sign-in and manual update)
      if (user || trigger === "update" || !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: (token.id ?? user?.id) as string },
          select: { role: true, currentPlan: true, onboardingCompleted: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.currentPlan = dbUser.currentPlan;
          token.onboardingCompleted = dbUser.onboardingCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.currentPlan = token.currentPlan as string;
      session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      return session;
    },
  },
});
