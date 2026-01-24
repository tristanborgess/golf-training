"use client";

import { Check, Globe, Layers } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";

export function Navbar() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav className="w-full border-b bg-muted">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">MicroApp</span>
          </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem
                  onClick={() => handleLocaleChange("en")}
                  className="cursor-pointer"
                >
                  <span className="flex flex-1 items-center justify-between">
                    English
                    {locale === "en" && <Check className="ml-2 h-4 w-4" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLocaleChange("es")}
                  className="cursor-pointer"
                >
                  <span className="flex flex-1 items-center justify-between">
                    Español
                    {locale === "es" && <Check className="ml-2 h-4 w-4" />}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
