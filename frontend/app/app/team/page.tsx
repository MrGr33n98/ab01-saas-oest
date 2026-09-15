export default function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Equipe</h1>
      <p className="mt-1 text-[15px] text-text-muted">Membros e papéis da organização</p>
      <div className="mt-8 overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-surface-soft text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Membro</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-4 py-3 text-text">Você</td>
              <td className="px-4 py-3 text-text-muted">owner</td>
              <td className="px-4 py-3 text-text-muted">active</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" className="btn-secondary mt-6">Convidar membro</button>
    </div>
  );
}
