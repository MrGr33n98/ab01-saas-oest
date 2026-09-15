import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label mb-1 block">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "input min-h-[90px] w-full resize-y py-2.5",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-[12px] text-danger">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
