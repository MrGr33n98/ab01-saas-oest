import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "DroneHub — Drone marketplace & Mission OS",
  description:
    "Post missions, compare verified operators, and receive decision-ready geospatial data in Brazil.",
  alternates: { canonical: "/en" },
};

export default function EnglishLandingPage() {
  const m = getMessages("en");
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
        <p className="text-sm font-medium text-text-muted">English</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          {m.landing.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] text-text-muted">
          {m.landing.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/sign-up" className="btn-primary">
            {m.landing.ctaMission}
          </Link>
          <Link href="/operators" className="btn-secondary">
            {m.landing.ctaOperators}
          </Link>
        </div>
        <p className="mt-10 text-sm text-text-muted">
          Billing in BRL · Operations focused on Brazil ·{" "}
          <Link href="/" className="underline">
            Português
          </Link>
        </p>
      </main>
    </div>
  );
}
