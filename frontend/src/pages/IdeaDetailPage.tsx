import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ideasApi } from "../services/ideasApi";
import type { IdeaDetail } from "../types";
import { useAuth } from "../hooks/useAuth";
import { AppShell } from "../components/layout/AppShell";
import { IdeaStatusBadge } from "../components/ideas/IdeaStatusBadge";
import { ReviewStepper } from "../components/ideas/ReviewStepper";
import { Button } from "../components/ui/button";
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
  const { user } = useAuth();
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Stage action state
  const [stageComment, setStageComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [stageActionLoading, setStageActionLoading] = useState(false);
  const [stageActionError, setStageActionError] = useState<string | null>(null);

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

  const isOwner = !!user && !!idea && user.id === idea.submitterId;
  const canEdit =
    isOwner && (idea.status === "Draft" || idea.status === "Submitted");
  const canDelete =
    isOwner && (idea.status === "Draft" || idea.status === "Submitted");

  const isAdminEvaluator = user?.role === "AdminEvaluator";
  const advanceable = idea
    ? ["Submitted", "InitialReview", "TechnicalReview", "FinalReview"].includes(
        idea.status,
      )
    : false;
  const rejectable = idea
    ? [
        "Submitted",
        "InitialReview",
        "TechnicalReview",
        "FinalReview",
        "UnderReview",
      ].includes(idea.status)
    : false;

  const nextStageName: Record<string, string> = {
    Submitted: "Initial Review",
    InitialReview: "Technical Review",
    TechnicalReview: "Final Review",
    FinalReview: "Accept",
  };

  async function handleAdvance() {
    if (!idea) return;
    setStageActionLoading(true);
    setStageActionError(null);
    try {
      const updated = await ideasApi.advanceStage(idea.id, stageComment);
      setIdea(updated);
      setStageComment("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to advance stage.";
      setStageActionError(msg);
    } finally {
      setStageActionLoading(false);
    }
  }

  async function handleReject() {
    if (!idea) return;
    setStageActionLoading(true);
    setStageActionError(null);
    try {
      const updated = await ideasApi.rejectIdea(idea.id, stageComment);
      setIdea(updated);
      setStageComment("");
      setShowRejectForm(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to reject idea.";
      setStageActionError(msg);
    } finally {
      setStageActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!idea) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await ideasApi.deleteIdea(idea.id);
      navigate("/my-ideas");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to delete idea.";
      setDeleteError(msg);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

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
              <div className="flex items-center gap-2 flex-shrink-0">
                <IdeaStatusBadge status={idea.status} />
                {canEdit && (
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/ideas/${idea.id}/edit`}>✏️ Edit</Link>
                  </Button>
                )}
                {canDelete && !confirmDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setConfirmDelete(true)}
                  >
                    🗑 Delete
                  </Button>
                )}
                {canDelete && confirmDelete && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-destructive font-medium">
                      Delete?
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleting}
                      onClick={handleDelete}
                    >
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deleting}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}

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

            {/* Review progress stepper — visible to all roles */}
            {idea.status !== "Draft" && <ReviewStepper status={idea.status} />}

            {/* Admin stage action panel */}
            {isAdminEvaluator && (advanceable || rejectable) && (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <h2 className="font-semibold text-base">Review Actions</h2>

                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder="Comment (optional)…"
                  value={stageComment}
                  onChange={(e) => setStageComment(e.target.value)}
                  disabled={stageActionLoading}
                />

                {stageActionError && (
                  <p className="text-sm text-destructive">{stageActionError}</p>
                )}

                <div className="flex gap-2">
                  {advanceable && !showRejectForm && (
                    <Button
                      size="sm"
                      disabled={stageActionLoading}
                      onClick={handleAdvance}
                    >
                      {stageActionLoading
                        ? "Advancing…"
                        : `Advance to ${nextStageName[idea.status] ?? "Next Stage"}`}
                    </Button>
                  )}
                  {rejectable && !showRejectForm && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      disabled={stageActionLoading}
                      onClick={() => setShowRejectForm(true)}
                    >
                      Reject
                    </Button>
                  )}
                  {showRejectForm && (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={stageActionLoading}
                        onClick={handleReject}
                      >
                        {stageActionLoading ? "Rejecting…" : "Confirm Reject"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={stageActionLoading}
                        onClick={() => setShowRejectForm(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

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

            {/* Stage transition history */}
            {idea.stageHistory && idea.stageHistory.length > 0 && (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <h2 className="font-semibold text-base">Review History</h2>
                <ol className="space-y-3">
                  {idea.stageHistory.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex gap-3 text-sm border-l-2 border-muted pl-3"
                    >
                      <div className="flex-1 space-y-0.5">
                        <p className="font-medium">
                          <span className="text-muted-foreground">
                            {entry.fromStatus}
                          </span>
                          {" → "}
                          <span
                            className={
                              entry.toStatus === "Rejected"
                                ? "text-destructive"
                                : entry.toStatus === "Accepted"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-primary"
                            }
                          >
                            {entry.toStatus}
                          </span>
                        </p>
                        <p className="text-muted-foreground text-xs">
                          by{" "}
                          <strong className="text-foreground">
                            {entry.evaluatorName}
                          </strong>{" "}
                          · {new Date(entry.transitionedAt).toLocaleString()}
                        </p>
                        {entry.comment && (
                          <p className="text-foreground">{entry.comment}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
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
