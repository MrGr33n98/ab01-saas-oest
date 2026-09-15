import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label className="flex items-start gap-2.5 cursor-pointer text-[13px] select-none">
        <input
          id={inputId}
          type="checkbox"
          ref={ref}
          className={cn(
            "mt-0.5 h-4 w-4 rounded border-border text-accent-ink focus:ring-accent-ink/20 cursor-pointer",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="leading-tight">
            {label && <span className="font-medium text-text">{label}</span>}
            {description && <p className="mt-0.5 text-[12px] text-text-muted">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
