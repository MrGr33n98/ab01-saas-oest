import { Layers, GitFork, Train, Zap, Building2, Anchor, type LucideIcon } from "lucide-react";
import type { CategoryUseCase } from "@/lib/categories";

const SUB_ICONS: Record<string, LucideIcon> = {
  road: GitFork,
  train: Train,
  zap: Zap,
  "building-2": Building2,
  anchor: Anchor,
};

export function CategoryUseCases({
  useCases,
  title,
  description,
}: {
  useCases: CategoryUseCase[];
  title?: string;
  description?: string;
}) {
  if (!useCases || useCases.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A9E60]">
        <Layers className="h-4 w-4" />
        <span>Casos de Uso & Aplicações</span>
      </div>
      <h2 className="mt-1 text-xl font-bold text-text sm:text-2xl">
        {title || "Aplicações Práticas"}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => {
          const Icon = (uc.icon_key && SUB_ICONS[uc.icon_key]) || Layers;
          return (
            <div
              key={uc.id}
              className="group rounded-xl border border-border bg-surface-soft/40 p-4 transition-all hover:border-border-strong hover:bg-surface"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border text-text group-hover:text-[#1A9E60] transition-colors shadow-2xs">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-text">
                {uc.title}
              </h3>
              {uc.short_description && (
                <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
                  {uc.short_description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
