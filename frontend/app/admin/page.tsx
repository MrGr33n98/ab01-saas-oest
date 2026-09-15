export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Admin</h1>
      <p className="mt-1 text-[15px] text-text-muted">Acesso restrito a platform_admin</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {["Operadores pendentes", "Missões ativas", "Disputas", "GMV mês"].map((l) => (
          <div key={l} className="card">
            <p className="text-[13px] text-text-muted">{l}</p>
            <p className="mt-1 text-xl font-semibold">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
