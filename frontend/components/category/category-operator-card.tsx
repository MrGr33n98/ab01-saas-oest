import Link from "next/link";
import { Star, MapPin, CheckCircle2, ArrowRight, Users2 } from "lucide-react";

export type CategoryOperatorData = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  city?: string;
  state_code?: string;
  rating_average: number;
  rating_count: number;
  missions_completed: number;
  anac_verified?: boolean;
  available?: boolean;
  skills: string[];
  avatar_url?: string | null;
  banner_image_url?: string | null;
};

export function CategoryOperatorCard({ op }: { op: CategoryOperatorData }) {
  const location = [op.city, op.state_code].filter(Boolean).join(", ");
  const bannerImage = op.banner_image_url || "/images/operator-hero-banner.jpg";
  const avatarImage = op.avatar_url || "/images/nuvem-geo-logo.png";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-border bg-surface shadow-xs transition-all hover:border-border-strong hover:shadow-md">
      <div>
        {/* Top Field Photo Banner */}
        <div className="relative h-36 w-full overflow-hidden bg-surface-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerImage}
            alt={op.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Availability Badge */}
          <div className="absolute right-3 top-3">
            <span className="flex items-center gap-1 rounded-full bg-[#1A9E60]/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Disponível
            </span>
          </div>

          {/* Overlapping Avatar Container */}
          <div className="absolute -bottom-4 left-4 h-12 w-12 rounded-xl border-2 border-surface bg-surface p-1 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarImage}
              alt={op.name}
              className="h-full w-full rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 pt-6">
          {/* Title & Location / Rating Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/operators/${op.slug}`}
                className="block truncate font-bold text-text transition-colors group-hover:text-primary"
              >
                {op.name}
              </Link>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-text-muted">
                {location && (
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-text-muted" />
                    {location}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 rounded bg-surface-soft px-1.5 py-0.5 text-[12px] font-bold text-text tabular-nums shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
              <span>{op.rating_average.toFixed(1)}</span>
              <span className="text-[11px] font-normal text-text-muted">({op.rating_count})</span>
            </div>
          </div>

          {/* Headline */}
          <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-text-muted">
            {op.headline}
          </p>

          {/* Skills / Payloads Pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {op.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-border/80 bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="flex items-center justify-between border-t border-border bg-surface-soft/40 px-4 py-2.5 text-[12px]">
        <div className="flex items-center gap-3 text-text-muted">
          <span className="flex items-center gap-1 font-medium text-text tabular-nums">
            <Users2 className="h-3.5 w-3.5 text-text-muted" />
            {op.missions_completed} missões
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#1A9E60]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#1A9E60]" />
            ANAC ✓
          </span>
        </div>

        <Link
          href={`/operators/${op.slug}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-2xs transition-all hover:border-border-strong hover:bg-surface-soft hover:text-text"
          title={`Ver perfil completo de ${op.name}`}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
