import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-accent-ink text-white",
  secondary: "border-transparent bg-surface-soft text-text",
  outline: "border-border text-text",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/15 text-warning",
  danger: "border-transparent bg-danger/15 text-danger",
  accent: "border-transparent bg-accent text-accent-ink",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
