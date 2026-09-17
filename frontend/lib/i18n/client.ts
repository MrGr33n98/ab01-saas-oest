"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LOCALE, getMessages, isLocale, t, type Locale, type MessageTree } from "./index";

const COOKIE = "NEXT_LOCALE";

export function readLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  const v = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export function writeLocale(next: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
  window.dispatchEvent(new CustomEvent("localeChange", { detail: next }));
}

export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Initial sync
    setLocaleState(readLocale());

    const onLocaleChange = (e: Event) => {
      const custom = e as CustomEvent<Locale>;
      if (custom.detail && isLocale(custom.detail)) {
        setLocaleState(custom.detail);
      } else {
        setLocaleState(readLocale());
      }
    };

    window.addEventListener("localeChange", onLocaleChange);
    return () => window.removeEventListener("localeChange", onLocaleChange);
  }, []);

  return locale;
}

export function useTranslations() {
  const locale = useLocale();
  const messages = getMessages(locale);
  const translate = useCallback(
    (path: string) => t(messages, path),
    [messages]
  );
  return { locale, messages, t: translate, setLocale: writeLocale };
}

export type { MessageTree, Locale };
