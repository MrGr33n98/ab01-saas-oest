import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { DATA_PRODUCTS } from "@/lib/categories";
import { BannerSlot } from "@/components/ads/banner-slot";

export const metadata = { title: "Produtos de dados" };

export default function DataProductsPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-text">Produtos de dados</h1>
        <div className="mt-6"><BannerSlot placement="data_products.top" /></div>
        <p className="mt-1 text-[15px] text-text-muted">
          Entregáveis geoespaciais prontos para GIS, CAD e decisão operacional.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DATA_PRODUCTS.map((p) => (
            <Link key={p.slug} href={`/data-products/${p.slug}`} className="card hover:border-border-strong">
              <h2 className="font-semibold text-text">{p.name}</h2>
              <p className="mt-1 text-[13px] text-text-muted">{p.type} · {p.unit}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
