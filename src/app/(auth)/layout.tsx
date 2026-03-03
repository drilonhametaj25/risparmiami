import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div className="py-6 px-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}
