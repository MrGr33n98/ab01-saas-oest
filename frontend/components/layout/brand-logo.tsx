import Link from "next/link";

type BrandLogoProps = {
  variant?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  tagline?: string;
  href?: string;
  className?: string;
};

export function BrandLogo({
  variant = "auto",
  size = "md",
  showTagline = true,
  tagline = "Drone Data as a Service",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      img: "h-6 sm:h-7",
      tagline: "text-[8px] tracking-wider",
      gap: "gap-2",
    },
    md: {
      img: "h-7 sm:h-8",
      tagline: "text-[9px] tracking-wider",
      gap: "gap-2.5",
    },
    lg: {
      img: "h-9 sm:h-10",
      tagline: "text-[10px] tracking-widest",
      gap: "gap-3",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${currentSize.gap} group transition-opacity hover:opacity-90 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/oest-logo.png"
        alt="OEST Logo"
        className={`${currentSize.img} w-auto object-contain transition-transform group-hover:scale-[1.02] ${
          isDark ? "brightness-0 invert opacity-95" : ""
        }`}
      />
      {showTagline && (
        <div
          className={`flex flex-col justify-center border-l pl-2 leading-tight ${
            isDark ? "border-white/20" : "border-border"
          }`}
        >
          <span
            className={`font-bold tracking-tight text-[13px] sm:text-[14px] leading-none ${
              isDark ? "text-white" : "text-text"
            }`}
          >
            OEST
          </span>
          <span
            className={`mt-0.5 uppercase font-semibold ${currentSize.tagline} ${
              isDark ? "text-white/60" : "text-text-muted"
            }`}
          >
            {tagline}
          </span>
        </div>
      )}
    </Link>
  );
}
