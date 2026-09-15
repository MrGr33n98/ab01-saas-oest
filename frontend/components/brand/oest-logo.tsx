import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OestLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  label?: string;
};

/**
 * One brand asset for every product shell. The source logo is intentionally
 * kept as an optimized Next image instead of duplicated in each layout.
 */
export function OestLogo({
  href = "/",
  className,
  imageClassName,
  priority = false,
  label = "OEST",
}: OestLogoProps) {
  const mark = (
    <span
      className={cn(
        "relative block h-10 w-10 shrink-0 overflow-hidden rounded-[3px] bg-brand-lightblue/30 p-1",
        className
      )}
    >
      <Image
        src="/images/oest-logo.png"
        alt={label}
        fill
        priority={priority}
        sizes="(max-width: 768px) 40px, 48px"
        className={cn("object-contain p-1", imageClassName)}
      />
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} aria-label={`${label} — página inicial`} className="inline-flex rounded-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">
      {mark}
    </Link>
  );
}
