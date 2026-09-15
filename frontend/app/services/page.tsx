import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import { BannerSlot } from "@/components/ads/banner-slot";

export const metadata = { title: "Serviços" };

export default function ServicesPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-text">Serviços aéreos</h1>
        <div className="mt-6"><BannerSlot placement="services.top" /></div>
        <p className="mt-1 text-[15px] text-text-muted">
          Escolha a categoria e encontre operadores com frota e compliance adequados.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/services/${c.slug}`} className="card hover:border-border-strong transition-colors">
              <h2 className="font-semibold text-text">{c.name}</h2>
              <p className="mt-2 text-[14px] text-text-muted">{c.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
