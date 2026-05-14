import { useState } from "react";
import type { IdeaSummary, EvaluationDecision } from "../../types";
import { evaluationsApi } from "../../services/evaluationsApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { StarRating } from "../ui/StarRating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EvaluationDialogProps {
  idea: IdeaSummary | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DIMENSIONS = [
  {
    key: "scoreFunctionality" as const,
    label: "Functionality",
    description: "Does it provide the necessary features?",
  },
  {
    key: "scoreReliability" as const,
    label: "Reliability",
    description: "Can it function without failure?",
  },
  {
    key: "scoreUsability" as const,
    label: "Usability",
    description: "How easily can users learn and use it?",
  },
  {
    key: "scoreMaintainability" as const,
    label: "Maintainability",
    description: "How easily can it be modified/updated?",
  },
  {
    key: "scoreEfficiency" as const,
    label: "Efficiency",
    description: "How efficiently does it use resources?",
  },
] as const;

type ScoreKey =
  | "scoreFunctionality"
  | "scoreReliability"
  | "scoreUsability"
  | "scoreMaintainability"
  | "scoreEfficiency";

type Scores = Record<ScoreKey, number>;

const DEFAULT_SCORES: Scores = {
  scoreFunctionality: 3,
  scoreReliability: 3,
  scoreUsability: 3,
  scoreMaintainability: 3,
  scoreEfficiency: 3,
};

export function EvaluationDialog({
  idea,
  open,
  onClose,
  onSuccess,
}: EvaluationDialogProps) {
  const [decision, setDecision] = useState<EvaluationDecision>("Accepted");
  const [comment, setComment] = useState("");
  const [scores, setScores] = useState<Scores>(DEFAULT_SCORES);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isFinalReview = idea?.status === "FinalReview";

  const overallPreview =
    Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 5) * 10) /
    10;

  function handleClose() {
    setDecision("Accepted");
    setComment("");
    setScores(DEFAULT_SCORES);
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!idea) return;
    if (!comment.trim()) {
      setError("A comment is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await evaluationsApi.evaluate(idea.id, {
        decision,
        comment: comment.trim(),
        ...(isFinalReview ? scores : {}),
      });
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "An error occurred.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Evaluate Idea</DialogTitle>
        </DialogHeader>
        {idea && (
          <p className="text-sm text-muted-foreground">
            <strong>{idea.title}</strong>
          </p>
        )}
        <div className="space-y-4">
          {/* Decision */}
          <div className="space-y-1">
            <Label>Decision</Label>
            <Select
              value={decision}
              onValueChange={(v) => setDecision(v as EvaluationDecision)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accepted">Accept</SelectItem>
                <SelectItem value="Rejected">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scoring dimensions — only at Final Review */}
          {isFinalReview && (
            <div className="space-y-2">
              <Label>Scores</Label>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                {DIMENSIONS.map((dim) => (
                  <div
                    key={dim.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{dim.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {dim.description}
                      </p>
                    </div>
                    <StarRating
                      value={scores[dim.key]}
                      onChange={(v) =>
                        setScores((prev) => ({ ...prev, [dim.key]: v }))
                      }
                      disabled={submitting}
                    />
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">Overall</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {overallPreview.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-1">
            <Label htmlFor="eval-comment">Comment (required)</Label>
            <Textarea
              id="eval-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide your evaluation feedback..."
              rows={4}
              maxLength={2000}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              variant={decision === "Rejected" ? "destructive" : "default"}
            >
              {submitting
                ? "Submitting..."
                : decision === "Accepted"
                  ? "Accept"
                  : "Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
