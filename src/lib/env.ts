import { z } from "zod";

const requiredSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z.string().min(1, "NEXTAUTH_URL is required"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
});

const optionalSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),
});

export function validateEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const required = requiredSchema.safeParse(process.env);
  if (!required.success) {
    console.error("Missing required environment variables:", required.error.flatten().fieldErrors);
    throw new Error("Missing required environment variables. Check server logs.");
  }

  const optional = optionalSchema.safeParse(process.env);
  if (!optional.success) {
    console.warn("Missing optional environment variables (some features will be disabled):", optional.error.flatten().fieldErrors);
  }
}
