import { Link } from "react-router-dom";
import type { IdeaSummary } from "../../types";
import { IdeaStatusBadge } from "./IdeaStatusBadge";

interface IdeaCardProps {
  idea: IdeaSummary;
  showSubmitter?: boolean;
}

export function IdeaCard({ idea, showSubmitter = false }: IdeaCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/ideas/${idea.id}`}
          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
        >
          {idea.title}
        </Link>
        <IdeaStatusBadge status={idea.status} />
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded bg-secondary px-1.5 py-0.5">
          {idea.category}
        </span>
        {showSubmitter && <span>{idea.submitterName}</span>}
        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
