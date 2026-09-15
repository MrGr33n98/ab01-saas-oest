import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";
import { SITE } from "@/lib/seo/content";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={organizationSchema(SITE.url)} />
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
