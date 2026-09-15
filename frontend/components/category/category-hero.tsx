import {
  BarChart3,
  ChevronRight,
  GitFork,
  Train,
  Zap,
  Building2,
  Anchor,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { CategoryDetail } from "@/lib/categories";

const SUB_ICONS: Record<string, LucideIcon> = {
  road: GitFork,
  train: Train,
  zap: Zap,
  "building-2": Building2,
  anchor: Anchor,
};

export function CategoryHero({ category }: { category: CategoryDetail }) {
  const bgImage = category.hero.image_url || "/images/operator-hero-banner.jpg";

  return (
    <div className="relative overflow-hidden rounded-card border border-border shadow-sm">
      {/* Background Image with Dual Gradient Overlays */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1624]/95 via-[#0d1624]/80 to-[#0d1624]/40" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0d1624]/40" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          {category.eyebrow && (
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-white/60 uppercase">
              <span>{category.eyebrow}</span>
              <span className="h-px w-8 bg-white/30" />
            </div>
          )}

          {/* H1 Headline */}
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {category.headline}
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-[14px] leading-relaxed text-white/80 sm:text-[15px]">
            {category.subheadline}
          </p>

          {/* Sub-segments Pill Bar */}
          {category.use_cases && category.use_cases.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-medium text-white/75">
              {category.use_cases.map((uc) => {
                const Icon = (uc.icon_key && SUB_ICONS[uc.icon_key]) || Layers;
                return (
                  <div
                    key={uc.id}
                    className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 backdrop-blur-xs transition-colors hover:bg-white/15"
                  >
                    <Icon className="h-3.5 w-3.5 text-white/80" />
                    <span>{uc.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Stats Widget */}
        <div className="shrink-0">
          <div className="flex items-center gap-3.5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur-md transition-transform hover:scale-[1.02]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight tabular-nums">
                {category.counts.operators} operadores
              </p>
              <p className="text-[11px] text-white/70">nesse setor</p>
            </div>
            <ChevronRight className="ml-1 h-4 w-4 text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
