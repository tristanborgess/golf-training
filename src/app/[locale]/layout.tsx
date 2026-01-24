import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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
  variable: "--font-sans",
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
  variable: "--font-serif",
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
    locale === "es" ? "Boilerplate de Micro Apps" : "Micro App Boilerplate";
  const description =
    locale === "es"
      ? "Starter minimal para construir micro apps con Next.js, shadcn/ui, tema y i18n."
      : "Minimal starter to build micro apps with Next.js, shadcn/ui, theme, and i18n.";

  return {
    title,
    description,
    icons: {
      icon: "/favicon.ico",
    },
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
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
