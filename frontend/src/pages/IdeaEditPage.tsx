import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ideasApi } from "../services/ideasApi";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  IDEA_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
  MAX_ATTACHMENTS_PER_IDEA,
} from "../lib/constants";
import type { IdeaDetail } from "../types";

export function IdeaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    ideasApi
      .getIdeaById(Number(id))
      .then((data) => {
        if (data.status !== "Draft" && data.status !== "Submitted") {
          setLoadError("Only Draft or Submitted ideas can be edited.");
          return;
        }
        setIdea(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
      })
      .catch(() => setLoadError("Idea not found or access denied."))
      .finally(() => setLoading(false));
  }, [id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!selected.length) return;

    const existing = idea?.attachments.length ?? 0;
    const incoming: File[] = [];
    const newErrors: Record<string, string> = {};

    for (const f of selected) {
      if (
        existing + newFiles.length + incoming.length >=
        MAX_ATTACHMENTS_PER_IDEA
      ) {
        newErrors.files = `You can attach at most ${MAX_ATTACHMENTS_PER_IDEA} files.`;
        break;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        newErrors.files = `"${f.name}" exceeds the 10 MB limit.`;
        continue;
      }
      if (!ALLOWED_FILE_TYPES.includes(f.type)) {
        newErrors.files = `"${f.name}" is not a supported file type.`;
        continue;
      }
      incoming.push(f);
    }

    if (Object.keys(newErrors).length) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
    } else {
      setErrors((prev) => {
        const n = { ...prev };
        delete n.files;
        return n;
      });
    }
    if (incoming.length) setNewFiles((prev) => [...prev, ...incoming]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const n = { ...prev };
      delete n.files;
      return n;
    });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!category) errs.category = "Category is required.";
    return errs;
  }

  async function sendUpdate(submit: boolean) {
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setGlobalError(null);
    submit ? setSubmitting(true) : setSaving(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    if (submit) formData.append("submit", "true");
    for (const f of newFiles) formData.append("newFiles", f);

    try {
      await ideasApi.updateDraft(Number(id), formData);
      navigate("/my-ideas");
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { error?: string } } })
        ?.response?.data;
      setGlobalError(resp?.error ?? "Failed to save changes.");
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    );
  }

  if (loadError || !idea) {
    return (
      <AppShell>
        <div className="max-w-2xl space-y-4">
          <p className="text-destructive">{loadError ?? "Idea not found."}</p>
          <Button variant="outline" onClick={() => navigate("/my-ideas")}>
            Back to My Ideas
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {idea.status === "Draft" ? "Edit Draft" : "Edit Idea"}
          </h1>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {globalError && (
            <p className="text-sm text-destructive">{globalError}</p>
          )}

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short, descriptive title"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {IDEA_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              maxLength={5000}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Existing attachments */}
          {idea.attachments.length > 0 && (
            <div className="space-y-1">
              <Label>Existing Attachments</Label>
              <ul className="text-sm text-muted-foreground space-y-1">
                {idea.attachments.map((att) => (
                  <li key={att.id} className="flex items-center gap-2">
                    <span>📎</span>
                    <span>{att.fileName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New file upload */}
          {idea.attachments.length + newFiles.length <
            MAX_ATTACHMENTS_PER_IDEA && (
            <div className="space-y-1">
              <Label htmlFor="newFiles">Add Attachments</Label>
              <Input
                id="newFiles"
                type="file"
                multiple
                onChange={handleFileChange}
                accept={ALLOWED_FILE_TYPES.join(",")}
              />
            </div>
          )}
          {newFiles.length > 0 && (
            <ul className="text-sm space-y-1">
              {newFiles.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-muted-foreground"
                >
                  <span>📎 {f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="text-destructive hover:text-destructive/80 font-bold"
                    aria-label={`Remove ${f.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.files && (
            <p className="text-xs text-destructive">{errors.files}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={saving || submitting}
              onClick={() => sendUpdate(false)}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            {idea.status === "Draft" && (
              <Button
                type="button"
                className="flex-1"
                disabled={submitting || saving}
                onClick={() => sendUpdate(true)}
              >
                {submitting ? "Submitting…" : "Submit Idea"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
