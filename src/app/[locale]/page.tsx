import { RangeNotes } from "@/components/range-notes";
import type { Language } from "@/lib/golf";
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await params;
  return <RangeNotes lang={locale} />;
}
