import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

const switzer = localFont({
  src: [
    {
      path: "../../../public/fonts/switzer-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/switzer-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/switzer-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/fonts/switzer-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "optional",
});

const plantin = localFont({
  src: [
    {
      path: "../../../public/fonts/plantin-mt-pro-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/plantin-mt-pro-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-editorial",
  display: "optional",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  await getMessages({ locale });

  const title =
    locale === "es"
      ? "Range Notes — Un mejor siguiente golpe"
      : "Range Notes — A better next shot";
  const description =
    locale === "es"
      ? "Prepara tu palo, entiende tu fallo y practica con claridad. Guía de golf bilingüe, para diestros y zurdos, disponible sin conexión."
      : "Find your setup, understand your miss, and practice with clarity. A bilingual, offline golf guide for right- and left-handed players.";

  return {
    title,
    description,
    icons: {
      icon: "/icon.svg",
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "es" ? "es_MX" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${switzer.variable} ${plantin.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
