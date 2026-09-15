type Hero = {
  image_url?: string | null;
  title?: string | null;
  subtitle?: string | null;
  custom?: boolean;
  placeholder?: boolean;
};

export function ProfileHero({
  hero,
  displayName,
  logoUrl,
}: {
  hero: Hero;
  displayName: string;
  logoUrl?: string | null;
}) {
  const bg =
    hero.custom && hero.image_url
      ? hero.image_url
      : undefined;

  return (
    <div className="overflow-hidden rounded-card border border-border">
      <div
        className="relative h-40 bg-gradient-to-br from-[#1a2e28] via-[#0B1413] to-[#243d34] sm:h-52"
        style={
          bg
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(11,20,19,0.35), rgba(11,20,19,0.85)), url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!bg && (
          <div className="absolute inset-0 flex items-end p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
              DroneHub · hero padrão
            </p>
          </div>
        )}
      </div>
      <div className="relative px-4 pb-5 pt-0 sm:px-6">
        <div className="-mt-10 flex items-end gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface bg-surface-soft text-xl font-bold text-text shadow-md">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (displayName || "DH").slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="mb-1 min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold text-text">
              {hero.title || displayName}
            </h1>
            {hero.subtitle && (
              <p className="text-sm text-text-muted">{hero.subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
