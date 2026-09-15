import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
};

export function StatCard({ label, value, hint, icon: Icon, trend, className }: Props) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-text">
              {value}
            </p>
            {(hint || trend) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {trend && (
                  <span
                    className={cn(
                      "font-medium",
                      trend.positive !== false ? "text-success" : "text-danger"
                    )}
                  >
                    {trend.value}
                  </span>
                )}
                {hint && <span className="text-text-muted">{hint}</span>}
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-surface-soft text-accent-ink">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
