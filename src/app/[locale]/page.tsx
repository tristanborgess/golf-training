"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useTranslations } from "@/lib/use-translations";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center">
        <div className="w-full max-w-4xl px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("Micro App Boilerplate")}
          </h1>

          <p className="mt-4 text-muted-foreground">
            {t("Minimal Next.js (App Router) + shadcn/ui + theming + i18n")}
          </p>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <p className="text-base leading-7">
                {t(
                  "Use this starter to build tiny, serverless-friendly apps without databases, users, or auth. Ship fast, deploy anywhere.",
                )}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a
                  href="https://github.com/SwapidoApp/vibe-code-boilerplate"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("View on GitHub")}
                </a>
              </Button>
            </CardFooter>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("Created by")}{" "}
            <a
              href="https://aureobitcoin.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Aureo
            </a>{" "}
            {t("for")}{" "}
            <a
              href="https://luma.com/fe4yv8qo?locale=es"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Bitcoin Day
            </a>{" "}
            {t("at")}{" "}
            <a
              href="https://lacasadesatoshi.xyz"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              La Casa de Satoshi
            </a>{" "}
            {t("in CDMX")}
          </p>
        </div>
      </main>
    </div>
  );
}
