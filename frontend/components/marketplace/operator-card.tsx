import Link from "next/link";
import { OperatorAvatar } from "./operator-avatar";
import { OperatorRating } from "./operator-rating";

export type OperatorCardData = {
  id: string;
  slug: string;
  headline?: string | null;
  verified?: boolean;
  rating_average?: number | null;
  rating_count?: number;
  missions_completed?: number;
  response_time_minutes?: number | null;
  organization_name?: string | null;
  city?: string | null;
  state_code?: string | null;
  logo_url?: string | null;
  accepting_jobs?: boolean;
};

export function OperatorCard({ op }: { op: OperatorCardData }) {
  const name = op.organization_name || op.slug;
  const location = [op.city, op.state_code].filter(Boolean).join(", ");

  return (
    <Link
      href={`/operators/${op.slug}`}
      className="card flex gap-4 transition-colors hover:border-border-strong"
    >
      <OperatorAvatar
        name={name}
        logoUrl={op.logo_url}
        size="md"
        verified={op.verified}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-text">{name}</p>
            {op.headline && (
              <p className="mt-0.5 line-clamp-2 text-[13px] text-text-muted">
                {op.headline}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2">
          <OperatorRating
            average={op.rating_average}
            count={op.rating_count ?? 0}
            size="sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-text-muted">
          {location && <span>{location}</span>}
          {(op.missions_completed ?? 0) > 0 && (
            <span className="tabular-nums">
              {op.missions_completed} missões concluídas
            </span>
          )}
          {op.response_time_minutes != null && op.response_time_minutes > 0 && (
            <span>~{op.response_time_minutes} min resposta</span>
          )}
          {op.accepting_jobs === false && (
            <span className="text-warning">Indisponível</span>
          )}
        </div>
      </div>
    </Link>
  );
}
