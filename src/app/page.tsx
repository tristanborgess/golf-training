"use client";
import { useEffect } from "react";
export default function LanguageEntry() {
  useEffect(() => {
    const preferred = navigator.languages?.[0] ?? navigator.language;
    location.replace(
      preferred.toLowerCase().startsWith("es") ? "/es/" : "/en/",
    );
  }, []);
  return (
    <html lang="en">
      <body>
        <p>
          Range Notes · <a href="/en/">English</a> · <a href="/es/">Español</a>
        </p>
      </body>
    </html>
  );
}
