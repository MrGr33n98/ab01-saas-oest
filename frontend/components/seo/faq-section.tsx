import { JsonLd, faqSchema } from "./json-ld";
import type { FaqItem } from "@/lib/seo/content";

export function FaqSection({
  items,
  title = "Perguntas frequentes",
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-14 border-t border-border pt-10">
      <JsonLd data={faqSchema(items)} />
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      <dl className="mt-6 space-y-6">
        {items.map((f) => (
          <div key={f.q}>
            <dt className="text-[16px] font-medium text-text">{f.q}</dt>
            <dd className="mt-1.5 text-[15px] leading-relaxed text-text-muted">
              {f.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
