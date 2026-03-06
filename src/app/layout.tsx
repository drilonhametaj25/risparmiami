import type { Metadata } from "next";
import Script from "next/script";
import { instrumentSerif, bodyFont, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://risparmiami.pro"),
  title: {
    default: "RisparmiaMi — Scopri quanto stai perdendo ogni anno",
    template: "%s | RisparmiaMi",
  },
  description:
    "Detrazioni non sfruttate, bonus mai richiesti, bollette troppo care. Gli italiani perdono in media 2.000-3.000 euro l'anno. Scopri il tuo risparmio in 2 minuti.",
  openGraph: {
    siteName: "RisparmiaMi",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${instrumentSerif.variable} ${bodyFont.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body bg-bg-primary text-text-primary antialiased">
        {children}
        {process.env.NEXT_PUBLIC_UMAMI_URL && (
          <Script
            async
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
