"use client";

import { useEffect, useRef, useState } from "react";
import { getApiBase } from "@/lib/api/client";

export type BannerCreative = {
  id: string;
  placement_key: string;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string;
  cta_url: string;
  image_url?: string | null;
  background_color?: string;
  text_color?: string;
  width_hint?: number;
  height_hint?: number;
};

type Props = {
  placement: string;
  category?: string;
  className?: string;
  /** inline | leaderboard | rectangle */
  variant?: "leaderboard" | "inline" | "sidebar";
};

function sessionId() {
  if (typeof window === "undefined") return "";
  const k = "dronehub.ad.sid";
  let v = sessionStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    sessionStorage.setItem(k, v);
  }
  return v;
}

async function track(
  bannerId: string,
  eventType: "impression" | "click",
  placement: string,
  category?: string
) {
  try {
    await fetch(`${getApiBase()}/ads/banners/${bannerId}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        event_type: eventType,
        placement,
        page_path: typeof window !== "undefined" ? window.location.pathname : "",
        category_slug: category,
        session_id: sessionId(),
      }),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

/**
 * Platform ad slot — fetches live creative for placement key.
 * Empty if no active campaign (no placeholder ads).
 */
export function BannerSlot({
  placement,
  category,
  className = "",
  variant = "leaderboard",
}: Props) {
  const [banner, setBanner] = useState<BannerCreative | null>(null);
  const impressed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams({ placement, limit: "1" });
    if (category) q.set("category", category);

    fetch(`${getApiBase()}/ads/banners?${q}`, {
      headers: { Accept: "application/json" },
      next: undefined,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled || !body?.data?.[0]) return;
        setBanner(body.data[0] as BannerCreative);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [placement, category]);

  useEffect(() => {
    if (!banner || impressed.current) return;
    impressed.current = true;
    track(banner.id, "impression", placement, category);
  }, [banner, placement, category]);

  if (!banner) return null;

  const height =
    variant === "sidebar" ? "min-h-[200px]" : variant === "inline" ? "min-h-[72px]" : "min-h-[88px]";

  return (
    <aside
      className={`relative overflow-hidden rounded-card border border-border ${height} ${className}`}
      aria-label="Anúncio"
      data-placement={placement}
    >
      <a
        href={banner.cta_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex h-full w-full items-center gap-4 px-4 py-3 transition-opacity hover:opacity-95"
        style={{
          backgroundColor: banner.background_color || "#10170D",
          color: banner.text_color || "#F4F7F2",
        }}
        onClick={() => track(banner.id, "click", placement, category)}
      >
        {banner.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.image_url}
            alt=""
            className="hidden h-14 w-14 shrink-0 rounded-input object-cover sm:block"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider opacity-70">Publicidade</p>
          {banner.title && (
            <p className="truncate text-[15px] font-semibold leading-tight">{banner.title}</p>
          )}
          {banner.subtitle && (
            <p className="mt-0.5 line-clamp-2 text-[13px] opacity-85">{banner.subtitle}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium">
          {banner.cta_label || "Saiba mais"}
        </span>
      </a>
    </aside>
  );
}
