export type BannerFormatType =
  | "hero_carousel"
  | "leaderboard"
  | "sidebar"
  | "in_feed"
  | "footer"
  | "ticker"
  | "standard";

export interface BannerAd {
  id: string;
  placement_key: string;
  name: string;
  format_type: BannerFormatType;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string;
  cta_url: string;
  image_url?: string | null;
  background_color?: string;
  text_color?: string;
  width_hint?: number;
  height_hint?: number;
  priority?: number;
  weight?: number;
}

export interface BannerTrackingPayload {
  event_type: "impression" | "click";
  placement: string;
  page_path?: string;
  category_slug?: string;
  session_id?: string;
}
