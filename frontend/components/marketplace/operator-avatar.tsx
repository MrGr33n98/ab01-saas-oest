type Props = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  verified?: boolean;
};

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-3xl",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Logo da organização ou monograma — nunca imagem inventada. */
export function OperatorAvatar({ name, logoUrl, size = "md", verified }: Props) {
  return (
    <div className="relative inline-flex shrink-0">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`Logo ${name}`}
          className={`${sizes[size]} rounded-full object-cover border border-border bg-surface-soft`}
        />
      ) : (
        <div
          className={`${sizes[size]} flex items-center justify-center rounded-full border border-border bg-surface-soft font-semibold text-text`}
          aria-hidden
        >
          {initials(name)}
        </div>
      )}
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-ink ring-2 ring-surface"
          title="Verificado"
        >
          ✓
        </span>
      )}
    </div>
  );
}
