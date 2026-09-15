import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "./json-ld";
import { SITE } from "@/lib/seo/content";

export type Crumb = { name: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schemaItems = items.map((c, i) => ({
    name: c.name,
    url: c.href
      ? `${SITE.url}${c.href}`
      : `${SITE.url}${items[i - 1]?.href || "/"}`,
  }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="text-[13px] text-text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-border-strong">/</span>}
              {c.href && i < items.length - 1 ? (
                <Link href={c.href} className="hover:text-text hover:underline">
                  {c.name}
                </Link>
              ) : (
                <span className={i === items.length - 1 ? "text-text" : ""}>
                  {c.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
