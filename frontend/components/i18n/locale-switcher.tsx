"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useLocale, writeLocale, type Locale } from "@/lib/i18n/client";

interface LocaleSwitcherProps {
  locale?: Locale;
  className?: string;
}

export function LocaleSwitcher({
  locale: propLocale,
  className = "",
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const activeLocale = propLocale || currentLocale;

  const handleSelect = useCallback(
    (next: Locale) => {
      if (next === activeLocale) return;
      writeLocale(next);

      // If the user happens to be on /en/*, clean up to normal path
      if (pathname.startsWith("/en")) {
        const rest = pathname.replace(/^\/en/, "") || "/";
        router.push(rest);
      } else {
        router.refresh();
      }
    },
    [activeLocale, pathname, router]
  );

  return (
    <div
      className={`inline-flex items-center rounded-full border border-oest-ink/15 bg-white/80 p-0.5 shadow-2xs backdrop-blur-sm transition-colors ${className}`}
      role="group"
      aria-label="Selecionar Idioma / Select Language"
    >
      <button
        type="button"
        onClick={() => handleSelect("pt-BR")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider transition-all duration-200 ${
          activeLocale === "pt-BR"
            ? "bg-oest-green text-white shadow-xs scale-100"
            : "text-oest-ink/60 hover:text-oest-ink hover:bg-black/5"
        }`}
        aria-pressed={activeLocale === "pt-BR"}
        title="Português (Brasil)"
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => handleSelect("en")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider transition-all duration-200 ${
          activeLocale === "en"
            ? "bg-oest-green text-white shadow-xs scale-100"
            : "text-oest-ink/60 hover:text-oest-ink hover:bg-black/5"
        }`}
        aria-pressed={activeLocale === "en"}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
