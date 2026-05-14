import { useState } from "react";
import type { IdeaSummary, EvaluationDecision } from "../../types";
import { evaluationsApi } from "../../services/evaluationsApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
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

export function EvaluationDialog({
  idea,
  open,
  onClose,
  onSuccess,
}: EvaluationDialogProps) {
  const [decision, setDecision] = useState<EvaluationDecision>("Accepted");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setDecision("Accepted");
    setComment("");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Evaluate Idea</DialogTitle>
        </DialogHeader>
        {idea && (
          <p className="text-sm text-muted-foreground">
            <strong>{idea.title}</strong>
          </p>
        )}
        <div className="space-y-4">
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
          <div className="space-y-1">
            <Label htmlFor="comment">Comment (required)</Label>
            <Textarea
              id="comment"
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
