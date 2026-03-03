import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "NEXTAUTH_SECRET must be at least 16 characters")
    .refine(
      (val) => !val.includes("dev-secret") && !val.includes("change-in-production"),
      "NEXTAUTH_SECRET must be changed from default value"
    ),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  CRON_SECRET: z
    .string()
    .min(16, "CRON_SECRET must be at least 16 characters")
    .refine(
      (val) => !val.includes("change-in-production"),
      "CRON_SECRET must be changed from default value"
    ),
});

export function validateEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. Check server logs for details.");
  }
}
