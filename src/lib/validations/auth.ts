import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Inserisci un indirizzo email valido"),
  password: z
    .string()
    .min(8, "La password deve avere almeno 8 caratteri"),
  name: z
    .string()
    .max(100, "Il nome non può superare i 100 caratteri")
    .optional(),
  referralCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
