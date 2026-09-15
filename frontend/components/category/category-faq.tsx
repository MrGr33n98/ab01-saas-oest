"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { CategoryFaq } from "@/lib/categories";

export function CategoryFAQ({
  faqs,
  title,
  description,
}: {
  faqs: CategoryFaq[];
  title?: string;
  description?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A9E60]">
        <HelpCircle className="h-4 w-4" />
        <span>Tire suas dúvidas</span>
      </div>
      <h2 className="mt-1 text-xl font-bold text-text sm:text-2xl">
        {title || "Perguntas Frequentes"}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      )}

      <div className="mt-6 divide-y divide-border">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="py-4">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between text-left text-[15px] font-semibold text-text transition-colors hover:text-[#1A9E60]"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#1A9E60]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-text-muted animate-in fade-in-50 duration-150">
                  {faq.short_answer && (
                    <div className="rounded-md border border-[#1A9E60]/20 bg-[#EBF7EE]/40 p-3 text-[13px] font-medium text-text">
                      <strong className="text-[#1A9E60]">Resumo Direto: </strong>
                      {faq.short_answer}
                    </div>
                  )}
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
