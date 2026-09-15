import { BrandLogo } from "@/components/layout/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex h-14 items-center border-b border-border bg-surface px-4 sm:px-6">
        <BrandLogo size="md" tagline="Drone Data as a Service" />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <footer className="border-t border-border py-4 text-center text-[12px] text-text-muted">
        Dados geoespaciais com processo claro · Brasil
      </footer>
    </div>
  );
}
