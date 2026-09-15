import { ptBR, type MessageTree } from "./messages/pt-BR";
import { en } from "./messages/en";

export type { MessageTree };
export type Locale = "pt-BR" | "en";

export const LOCALES: Locale[] = ["pt-BR", "en"];
export const DEFAULT_LOCALE: Locale = "pt-BR";

const catalogs: Record<Locale, MessageTree> = {
  "pt-BR": ptBR,
  en,
};

export function isLocale(v: string | null | undefined): v is Locale {
  return v === "pt-BR" || v === "en";
}

export function getMessages(locale: Locale): MessageTree {
  return catalogs[locale] || ptBR;
}

/** Dot-path getter: t(messages, "nav.signIn") */
export function t(messages: MessageTree, path: string): string {
  const parts = path.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

export function htmlLang(locale: Locale): string {
  return locale === "en" ? "en" : "pt-BR";
}
