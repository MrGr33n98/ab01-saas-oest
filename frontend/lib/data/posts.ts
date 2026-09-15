import "server-only";
import { cache } from "react";
import { cacheTags } from "@/lib/cache/cacheTags";
import { nextRevalidation } from "@/lib/cache/policies";
import { publicApiBase } from "@/lib/data/public-api";
import type { Locale } from "@/lib/i18n";

export type PublicPost = {
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  published_at?: string;
  category_slugs?: string[];
  path?: string;
  author_name?: string;
  faqs?: Array<{ question: string; answer: string }>;
};

type Envelope<T> = { data: T };

export const getPosts = cache(async (locale: Locale): Promise<PublicPost[]> => {
  try {
    const response = await fetch(
      `${publicApiBase()}/content/posts?locale=${encodeURIComponent(locale)}`,
      {
        next: {
          revalidate: nextRevalidation("articleIndex"),
          tags: [cacheTags.articleIndex(locale)],
        },
      }
    );

    if (!response.ok) return [];
    const body = (await response.json()) as Envelope<PublicPost[]>;
    return body.data || [];
  } catch {
    return [];
  }
});

export const getPost = cache(async (slug: string): Promise<PublicPost | null> => {
  try {
    const response = await fetch(
      `${publicApiBase()}/content/posts/${encodeURIComponent(slug)}`,
      {
        next: {
          revalidate: nextRevalidation("article"),
          tags: [cacheTags.article(slug)],
        },
      }
    );

    if (!response.ok) return null;
    const body = (await response.json()) as Envelope<PublicPost>;
    return body.data || null;
  } catch {
    return null;
  }
});
