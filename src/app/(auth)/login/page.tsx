import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Accedi",
  description: "Accedi al tuo account RisparmiaMi per scoprire quanto puoi risparmiare.",
};

export default function LoginPage() {
  return <LoginForm />;
}
