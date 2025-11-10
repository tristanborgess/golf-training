"use client";

import { useTranslations as useNextIntlTranslations } from "next-intl";
import { hashKey, interpolate } from "./i18n-utils";

/**
 * Custom translation hook for "English-as-source".
 * - Accepts the English phrase directly
 * - Looks up via hashed key (no dot issues)
 * - Falls back to the English phrase with simple interpolation
 */
export function useTranslations() {
  const t0 = useNextIntlTranslations();

  return (english: string, values?: Record<string, unknown>) => {
    const key = hashKey(english);
    try {
      // next-intl translators accept a second argument with values
      const invoke = t0 as unknown as (
        k: string,
        v?: Record<string, unknown>,
      ) => string;
      return invoke(key, values);
    } catch {
      return interpolate(english, values);
    }
  };
}
