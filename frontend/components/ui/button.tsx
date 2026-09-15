import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-95",
  secondary: "border border-border-strong bg-surface text-text hover:bg-surface-soft",
  outline: "border border-border bg-transparent text-text hover:bg-surface-soft",
  ghost: "text-text-muted hover:bg-surface-soft hover:text-text",
  danger: "bg-danger text-white hover:brightness-95",
};

const sizes = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-[15px]",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, loading, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-input font-medium transition-colors cursor-pointer",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
