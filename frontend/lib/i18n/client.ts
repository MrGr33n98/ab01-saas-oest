"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LOCALE, getMessages, isLocale, t, type Locale, type MessageTree } from "./index";

function readLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  const v = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    setLocale(readLocale());
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
  return { locale, messages, t: translate };
}

export type { MessageTree, Locale };
