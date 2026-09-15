"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

/**
 * Premium contentEditable editor (TipTap-compatible HTML output).
 * When @tiptap/* is installed, swap internals — API stays the same.
 * Outputs semantic HTML (h2, p, ul, strong) for SEO/AEO.
 */
export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");

  useEffect(() => {
    if (mode === "visual" && ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value, mode]);

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function onInput() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className="overflow-hidden rounded-input border border-border bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-border bg-surface-soft p-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("bold")}>
          B
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("italic")}>
          I
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("formatBlock", "h2")}>
          H2
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("formatBlock", "p")}>
          P
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("insertUnorderedList")}>
          Lista
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            const url = window.prompt("URL");
            if (url) exec("createLink", url);
          }}
        >
          Link
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "visual" ? "secondary" : "ghost"}
            onClick={() => setMode("visual")}
          >
            Visual
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "html" ? "secondary" : "ghost"}
            onClick={() => setMode("html")}
          >
            HTML
          </Button>
        </div>
      </div>
      {mode === "visual" ? (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={onInput}
          className="min-h-[220px] px-4 py-3 text-[15px] leading-relaxed text-text focus:outline-none"
          data-placeholder={placeholder}
        />
      ) : (
        <textarea
          className="min-h-[220px] w-full resize-y bg-surface px-4 py-3 font-mono text-[13px] text-text focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <p className="border-t border-border px-3 py-1.5 text-[11px] text-text-muted">
        Editor premium · HTML semântico (H2/P/listas) · pronto para TipTap package
      </p>
    </div>
  );
}
