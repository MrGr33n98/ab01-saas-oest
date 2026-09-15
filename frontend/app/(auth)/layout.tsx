import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex h-14 items-center border-b border-border bg-surface px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-input bg-accent text-sm font-bold text-accent-ink">
            DH
          </span>
          <span className="text-sm font-semibold text-text">DroneHub</span>
        </Link>
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
