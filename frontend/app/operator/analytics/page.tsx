export default function OperatorAnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Analytics</h1>
      <p className="mt-1 text-[15px] text-text-muted">Win rate, receita, tempo de resposta, rating</p>
      <div className="mt-8 card h-48 flex items-center justify-center text-text-muted">
        Gráficos (conectar OperatorDashboardQuery)
      </div>
    </div>
  );
}
