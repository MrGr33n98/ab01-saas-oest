import Link from "next/link";
import { ArrowRight, LayoutGrid, Zap, Building2, HardHat, Mountain, Sprout, Home, ShieldCheck, Trees, type LucideIcon } from "lucide-react";
import type { CategoryRelated } from "@/lib/categories";

const ICONS: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  "zap": Zap,
  "building-2": Building2,
  "hard-hat": HardHat,
  "mountain": Mountain,
  "sprout": Sprout,
  "home": Home,
  "shield-check": ShieldCheck,
  "trees": Trees,
};

export function CategoryRelatedGrid({
  categories,
  title,
}: {
  categories: CategoryRelated[];
  title?: string;
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-bold text-text sm:text-2xl">
        {title || "Setores Relacionados"}
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Explore outros hubs de dados e serviços aéreos complementares.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon_key] || Building2;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-surface-soft/40 p-4 transition-all hover:border-border-strong hover:bg-surface hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border text-text-muted group-hover:text-[#1A9E60] transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[12px] text-text-muted tabular-nums">
                    {cat.operators_count} operadores
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-text" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
