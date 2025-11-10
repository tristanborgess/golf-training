"use client";

import Link from "next/link";
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
            {t("Micro App Boilerplate!")}
          </h1>

          <p className="mt-4 text-muted-foreground">
            {t("Minimal Next.js (App Router) + shadcn/ui + theming + i18n!!!")}
          </p>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <p className="text-base leading-7">
                {t(
                  "Use this starter to build tiny, serverless-friendly apps without databases, users, or auth. Ship fast, deploy anywhere, and drive traffic to Aureo Bitcoin.",
                )}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link
                  href="https://aureobitcoin.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Visit Aureo Bitcoin NOW")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
