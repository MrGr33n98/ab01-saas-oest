type Props = {
  average: number | null | undefined;
  count: number;
  size?: "sm" | "md";
};

/**
 * Honest rating: if count === 0, show "Sem avaliações" — never fake stars.
 */
export function OperatorRating({ average, count, size = "md" }: Props) {
  const text = size === "sm" ? "text-[13px]" : "text-[15px]";

  if (!count || average == null) {
    return (
      <span className={`${text} text-text-muted`}>Sem avaliações ainda</span>
    );
  }

  return (
    <span className={`${text} text-text`}>
      <span className="font-semibold tabular-nums">{average.toFixed(1)}</span>
      <span className="text-text-muted"> / 5</span>
      <span className="text-text-muted">
        {" "}
        · {count} {count === 1 ? "avaliação" : "avaliações"}
      </span>
    </span>
  );
}
