import Link from "next/link";
import { ArrowRight, MessageSquareQuote } from "lucide-react";

export function CategoryCTA({
  title,
  description,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-card border border-border bg-[#0d1624] p-8 text-white sm:p-10 shadow-md">
      {/* Subtle top ambient glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#1A9E60]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A9E60]">
            <MessageSquareQuote className="h-4 w-4" />
            <span>Mission Control OEST</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row w-full lg:w-auto">
          <Link
            href={primaryUrl}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1A9E60] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15824e] shadow-sm"
          >
            <span>{primaryLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={secondaryUrl}
            className="flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
