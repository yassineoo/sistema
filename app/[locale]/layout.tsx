import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import QueryProvider from "@/components/QueryProvider";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "sonner";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sestima Confort — Matériaux • Outils • Cuisine • Plomberie",
  description:
    "Sestima Confort — votre partenaire professionnel pour les matériaux de construction, outillage, équipements cuisine et plomberie. Livraison partout en Algérie.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <body
        className={`${dmSans.variable} ${barlowCondensed.variable} ${cairo.variable} antialiased`}
        style={{
          fontFamily: isRTL
            ? "var(--font-cairo), 'Cairo', system-ui, sans-serif"
            : "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
        }}
      >
        <QueryProvider>
          <CartProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
            <Toaster richColors position="top-right" />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
