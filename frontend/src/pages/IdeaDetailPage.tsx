import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ideasApi } from "../services/ideasApi";
import type { IdeaDetail } from "../types";
import { AppShell } from "../components/layout/AppShell";
import { IdeaStatusBadge } from "../components/ideas/IdeaStatusBadge";
import { Skeleton } from "../components/ui/skeleton";

/** Renders text that may contain **bold** markers and newlines as JSX. */
function renderDescription(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Fragment key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          ),
        )}
      </Fragment>
    );
  });
}

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ideasApi
      .getIdeaById(Number(id))
      .then(setIdea)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "Failed to load idea.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && <p className="text-destructive">{error}</p>}

        {idea && !loading && (
          <>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{idea.title}</h1>
              <IdeaStatusBadge status={idea.status} />
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                Category:{" "}
                <strong className="text-foreground">{idea.category}</strong>
              </span>
              <span>
                By:{" "}
                <strong className="text-foreground">
                  {idea.submitterName}
                </strong>
              </span>
              <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm leading-relaxed">
                {renderDescription(idea.description)}
              </p>
            </div>

            {idea.attachments && idea.attachments.length > 0 && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                <span className="text-sm font-medium">
                  Attachments ({idea.attachments.length})
                </span>
                <ul className="space-y-1">
                  {idea.attachments.map((att) => (
                    <li key={att.id} className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          ideasApi.downloadAttachment(
                            idea.id,
                            att.id,
                            att.fileName,
                          )
                        }
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {att.fileName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {idea.evaluation &&
              (idea.status === "Accepted" || idea.status === "Rejected") && (
                <div className="rounded-lg border bg-card p-4 space-y-2">
                  <h2 className="font-semibold text-base">
                    Evaluator Feedback
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <strong>{idea.evaluation.evaluatorName}</strong> —{" "}
                    {new Date(idea.evaluation.decidedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {idea.evaluation.comment}
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </AppShell>
  );
}
