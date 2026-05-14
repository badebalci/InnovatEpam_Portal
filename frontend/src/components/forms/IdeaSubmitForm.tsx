import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ideasApi } from "../../services/ideasApi";
import {
  IDEA_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
} from "../../lib/constants";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function IdeaSubmitForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        setErrors((prev) => ({
          ...prev,
          file: "File exceeds the maximum allowed size of 10 MB.",
        }));
        e.target.value = "";
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(selected.type)) {
        setErrors((prev) => ({
          ...prev,
          file: "File type not supported. Allowed: PDF, DOCX, PNG, JPG.",
        }));
        e.target.value = "";
        return;
      }
      setErrors((prev) => {
        const n = { ...prev };
        delete n.file;
        return n;
      });
    }
    setFile(selected);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!category) errs.category = "Category is required.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setGlobalError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    if (file) formData.append("file", file);

    try {
      const idea = await ideasApi.createIdea(formData);
      setSuccessId(idea.id);
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setFile(null);
    } catch (err: unknown) {
      const resp = (
        err as {
          response?: {
            data?: { errors?: Record<string, string[]>; error?: string };
          };
        }
      )?.response?.data;
      if (resp?.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(resp.errors)) {
          flat[k.toLowerCase()] = (v as string[])[0] ?? "";
        }
        setErrors(flat);
      } else {
        setGlobalError(resp?.error ?? "Submission failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (successId !== null) {
    return (
      <div className="rounded-lg border bg-green-50 p-6 text-center space-y-4">
        <p className="text-lg font-semibold text-green-700">
          Idea submitted! Reference #{successId}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => setSuccessId(null)}>Submit Another</Button>
          <Button variant="outline" onClick={() => navigate("/my-ideas")}>
            View My Ideas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && <p className="text-sm text-destructive">{globalError}</p>}

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

      <div className="space-y-1">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your idea in detail..."
          rows={5}
          maxLength={5000}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

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

      <div className="space-y-1">
        <Label htmlFor="file">Attachment (optional, max 10 MB)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Allowed: PDF, DOCX, PNG, JPG
        </p>
        {errors.file && (
          <p className="text-xs text-destructive">{errors.file}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Idea"}
      </Button>
    </form>
  );
}
