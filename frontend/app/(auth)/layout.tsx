export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F6F8F7] text-oest-ink selection:bg-oest-blue selection:text-white">
      {children}
    </div>
  );
}
