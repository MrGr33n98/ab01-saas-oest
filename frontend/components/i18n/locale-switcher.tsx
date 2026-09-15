"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Locale } from "@/lib/i18n";

const COOKIE = "NEXT_LOCALE";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      // Soft refresh so server components pick cookie if middleware reads it
      router.refresh();
      // Also support prefix strategy when path starts with /en
      if (next === "en" && !pathname.startsWith("/en")) {
        router.push(`/en${pathname === "/" ? "" : pathname}`);
      } else if (next === "pt-BR" && pathname.startsWith("/en")) {
        const rest = pathname.replace(/^\/en/, "") || "/";
        router.push(rest);
      }
    },
    [pathname, router]
  );

  return (
    <div
      className="inline-flex items-center rounded-input border border-border text-[12px] font-medium"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`px-2.5 py-1.5 ${
          locale === "pt-BR" ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text"
        }`}
        onClick={() => setLocale("pt-BR")}
      >
        PT
      </button>
      <button
        type="button"
        className={`px-2.5 py-1.5 ${
          locale === "en" ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text"
        }`}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
