import { CategoryOperatorCard, type CategoryOperatorData } from "./category-operator-card";

export function CategoryOperatorGrid({
  operators,
  viewMode = "grid",
}: {
  operators: CategoryOperatorData[];
  viewMode?: "grid" | "list" | "map";
}) {
  if (!operators || operators.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
        <p className="font-semibold text-text">Nenhum operador encontrado com os filtros selecionados</p>
        <p className="mt-1 text-sm text-text-muted">
          Tente ajustar os filtros de localização ou serviços para visualizar mais operadores credenciados.
        </p>
      </div>
    );
  }

  if (viewMode === "map") {
    return (
      <div className="relative h-96 overflow-hidden rounded-card border border-border bg-[#14223c] p-6 text-center text-white flex flex-col items-center justify-center">
        <div className="max-w-md">
          <p className="text-base font-bold">Mapa de Cobertura Georreferenciada</p>
          <p className="mt-1 text-xs text-white/70">
            {operators.length} bases operacionais ativas com atendimento imediato na região.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "list"
          ? "flex flex-col gap-4"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {operators.map((op) => (
        <CategoryOperatorCard key={op.id} op={op} />
      ))}
    </div>
  );
}
