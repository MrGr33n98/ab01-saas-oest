"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  href?: string;
};

export function ActivationChecklist({
  title,
  items,
}: {
  title: string;
  items: ChecklistItem[];
}) {
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  if (allDone) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-text-muted">
          {doneCount}/{items.length} concluídos
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href || "#"}
                className={cn(
                  "flex items-center gap-2 rounded-input px-2 py-1.5 text-sm transition-colors",
                  item.done
                    ? "text-text-muted line-through"
                    : "text-text hover:bg-surface-soft"
                )}
              >
                {item.done ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4 text-text-muted" />
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
