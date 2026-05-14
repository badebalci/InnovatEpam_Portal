import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ideasApi } from "../../services/ideasApi";
import {
  IDEA_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
  MAX_ATTACHMENTS_PER_IDEA,
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

// ─── Category-specific extra fields ───────────────────────────────────────────

interface CategoryFields {
  // Technology
  techStack: string;
  implementationComplexity: string;
  // Process
  currentProcess: string;
  expectedImprovement: string;
  // Product
  targetUsers: string;
  businessValue: string;
  // People
  targetAudience: string;
  impactOnPeople: string;
}

const EMPTY_CATEGORY_FIELDS: CategoryFields = {
  techStack: "",
  implementationComplexity: "",
  currentProcess: "",
  expectedImprovement: "",
  targetUsers: "",
  businessValue: "",
  targetAudience: "",
  impactOnPeople: "",
};

/** Build the final description string by appending category-specific details. */
function buildDescription(
  base: string,
  category: string,
  cf: CategoryFields,
): string {
  const lines: string[] = [base.trim()];

  if (category === "Technology") {
    if (cf.techStack.trim())
      lines.push(`\n**Tech Stack:**\n${cf.techStack.trim()}`);
    if (cf.implementationComplexity)
      lines.push(
        `\n**Implementation Complexity:** ${cf.implementationComplexity}`,
      );
  } else if (category === "Process") {
    if (cf.currentProcess.trim())
      lines.push(`\n**Current Process:**\n${cf.currentProcess.trim()}`);
    if (cf.expectedImprovement.trim())
      lines.push(
        `\n**Expected Improvement:**\n${cf.expectedImprovement.trim()}`,
      );
  } else if (category === "Product") {
    if (cf.targetUsers.trim())
      lines.push(`\n**Target Users:**\n${cf.targetUsers.trim()}`);
    if (cf.businessValue.trim())
      lines.push(`\n**Business Value:**\n${cf.businessValue.trim()}`);
  } else if (category === "People") {
    if (cf.targetAudience.trim())
      lines.push(`\n**Target Audience:**\n${cf.targetAudience.trim()}`);
    if (cf.impactOnPeople.trim())
      lines.push(`\n**Impact on People:**\n${cf.impactOnPeople.trim()}`);
  }

  return lines.join("\n");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IdeaSubmitForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categoryFields, setCategoryFields] = useState<CategoryFields>(
    EMPTY_CATEGORY_FIELDS,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [isBlindReview, setIsBlindReview] = useState(false);

  function setCF(key: keyof CategoryFields, value: string) {
    setCategoryFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setCategoryFields(EMPTY_CATEGORY_FIELDS);
    setErrors((prev) => {
      const n = { ...prev };
      delete n.category;
      // clear any leftover category field errors
      for (const k of Object.keys(EMPTY_CATEGORY_FIELDS)) delete n[k];
      return n;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!selected.length) return;

    const incoming: File[] = [];
    const newErrors: Record<string, string> = {};

    for (const f of selected) {
      if (files.length + incoming.length >= MAX_ATTACHMENTS_PER_IDEA) {
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
    if (incoming.length) setFiles((prev) => [...prev, ...incoming]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const n = { ...prev };
      delete n.files;
      return n;
    });
  }

  function validateDraft() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!category) errs.category = "Category is required.";
    return errs;
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!category) errs.category = "Category is required.";

    if (category === "Technology") {
      if (!categoryFields.techStack.trim())
        errs.techStack = "Tech Stack is required for Technology ideas.";
      if (!categoryFields.implementationComplexity)
        errs.implementationComplexity =
          "Implementation Complexity is required.";
    } else if (category === "Process") {
      if (!categoryFields.currentProcess.trim())
        errs.currentProcess = "Current Process description is required.";
      if (!categoryFields.expectedImprovement.trim())
        errs.expectedImprovement = "Expected Improvement is required.";
    } else if (category === "Product") {
      if (!categoryFields.targetUsers.trim())
        errs.targetUsers = "Target Users is required.";
      if (!categoryFields.businessValue.trim())
        errs.businessValue = "Business Value is required.";
    } else if (category === "People") {
      if (!categoryFields.targetAudience.trim())
        errs.targetAudience = "Target Audience is required.";
      if (!categoryFields.impactOnPeople.trim())
        errs.impactOnPeople = "Impact on People is required.";
    }

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

    const fullDescription = buildDescription(
      description,
      category,
      categoryFields,
    );

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", fullDescription);
    formData.append("category", category);
    formData.append("isBlindReview", String(isBlindReview));
    for (const f of files) formData.append("files", f);

    try {
      const idea = await ideasApi.createIdea(formData);
      setSuccessId(idea.id);
      setSavedAsDraft(false);
      setTitle("");
      setDescription("");
      setCategory("");
      setCategoryFields(EMPTY_CATEGORY_FIELDS);
      setFiles([]);
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

  async function handleSaveAsDraft(e: React.MouseEvent) {
    e.preventDefault();
    const draftErrors = validateDraft();
    if (Object.keys(draftErrors).length) {
      setErrors(draftErrors);
      return;
    }
    setErrors({});
    setGlobalError(null);
    setSavingDraft(true);

    const fullDescription = buildDescription(
      description,
      category,
      categoryFields,
    );
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", fullDescription);
    formData.append("category", category);
    formData.append("saveAsDraft", "true");
    formData.append("isBlindReview", String(isBlindReview));
    for (const f of files) formData.append("files", f);

    try {
      const idea = await ideasApi.createIdea(formData);
      setSuccessId(idea.id);
      setSavedAsDraft(true);
      setTitle("");
      setDescription("");
      setCategory("");
      setCategoryFields(EMPTY_CATEGORY_FIELDS);
      setFiles([]);
    } catch (err: unknown) {
      const resp = (
        err as {
          response?: {
            data?: { errors?: Record<string, string[]>; error?: string };
          };
        }
      )?.response?.data;
      setGlobalError(resp?.error ?? "Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  if (successId !== null) {
    return (
      <div
        className={`rounded-lg border p-6 text-center space-y-4 ${savedAsDraft ? "bg-gray-50" : "bg-green-50"}`}
      >
        <p
          className={`text-lg font-semibold ${savedAsDraft ? "text-gray-700" : "text-green-700"}`}
        >
          {savedAsDraft
            ? `Draft saved! Reference #${successId}`
            : `Idea submitted! Reference #${successId}`}
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => {
              setSuccessId(null);
              setSavedAsDraft(false);
            }}
          >
            {savedAsDraft ? "Edit Another" : "Submit Another"}
          </Button>
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

      {/* Description */}
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

      {/* Category */}
      <div className="space-y-1">
        <Label>Category *</Label>
        <Select value={category} onValueChange={handleCategoryChange}>
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

      {/* ── Technology fields ── */}
      {category === "Technology" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Technology Details
          </p>

          <div className="space-y-1">
            <Label htmlFor="techStack">Tech Stack *</Label>
            <Input
              id="techStack"
              value={categoryFields.techStack}
              onChange={(e) => setCF("techStack", e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL"
              maxLength={500}
            />
            {errors.techStack && (
              <p className="text-xs text-destructive">{errors.techStack}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Implementation Complexity *</Label>
            <Select
              value={categoryFields.implementationComplexity}
              onValueChange={(v) => setCF("implementationComplexity", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">
                  Low — simple change or script
                </SelectItem>
                <SelectItem value="Medium">
                  Medium — moderate effort, few teams
                </SelectItem>
                <SelectItem value="High">
                  High — significant effort, multiple teams
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.implementationComplexity && (
              <p className="text-xs text-destructive">
                {errors.implementationComplexity}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Process fields ── */}
      {category === "Process" && (
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 space-y-4">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
            Process Details
          </p>

          <div className="space-y-1">
            <Label htmlFor="currentProcess">Current Process *</Label>
            <Textarea
              id="currentProcess"
              value={categoryFields.currentProcess}
              onChange={(e) => setCF("currentProcess", e.target.value)}
              placeholder="Describe how the process works today..."
              rows={3}
              maxLength={1000}
            />
            {errors.currentProcess && (
              <p className="text-xs text-destructive">
                {errors.currentProcess}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="expectedImprovement">Expected Improvement *</Label>
            <Textarea
              id="expectedImprovement"
              value={categoryFields.expectedImprovement}
              onChange={(e) => setCF("expectedImprovement", e.target.value)}
              placeholder="What will improve and by how much?"
              rows={3}
              maxLength={1000}
            />
            {errors.expectedImprovement && (
              <p className="text-xs text-destructive">
                {errors.expectedImprovement}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Product fields ── */}
      {category === "Product" && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4 space-y-4">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
            Product Details
          </p>

          <div className="space-y-1">
            <Label htmlFor="targetUsers">Target Users *</Label>
            <Input
              id="targetUsers"
              value={categoryFields.targetUsers}
              onChange={(e) => setCF("targetUsers", e.target.value)}
              placeholder="e.g. Internal employees, external clients"
              maxLength={300}
            />
            {errors.targetUsers && (
              <p className="text-xs text-destructive">{errors.targetUsers}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="businessValue">Business Value *</Label>
            <Textarea
              id="businessValue"
              value={categoryFields.businessValue}
              onChange={(e) => setCF("businessValue", e.target.value)}
              placeholder="What business problem does this solve?"
              rows={3}
              maxLength={1000}
            />
            {errors.businessValue && (
              <p className="text-xs text-destructive">{errors.businessValue}</p>
            )}
          </div>
        </div>
      )}

      {/* ── People fields ── */}
      {category === "People" && (
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-4">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            People & Culture Details
          </p>

          <div className="space-y-1">
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Input
              id="targetAudience"
              value={categoryFields.targetAudience}
              onChange={(e) => setCF("targetAudience", e.target.value)}
              placeholder="e.g. All employees, new hires, managers"
              maxLength={300}
            />
            {errors.targetAudience && (
              <p className="text-xs text-destructive">
                {errors.targetAudience}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="impactOnPeople">Impact on People *</Label>
            <Textarea
              id="impactOnPeople"
              value={categoryFields.impactOnPeople}
              onChange={(e) => setCF("impactOnPeople", e.target.value)}
              placeholder="How will this improve people's experience or well-being?"
              rows={3}
              maxLength={1000}
            />
            {errors.impactOnPeople && (
              <p className="text-xs text-destructive">
                {errors.impactOnPeople}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="space-y-2">
        <Label htmlFor="files">
          Attachments (optional, up to {MAX_ATTACHMENTS_PER_IDEA} files, max 10
          MB each)
        </Label>

        {files.length < MAX_ATTACHMENTS_PER_IDEA && (
          <Input
            id="files"
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg,.mp4,.mov,.zip"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        )}

        <p className="text-xs text-muted-foreground">
          Allowed: PDF, DOCX, PNG, JPG, MP4, MOV, ZIP
        </p>

        {files.length > 0 && (
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded border bg-muted/40 px-3 py-1.5 text-sm"
              >
                <span className="truncate max-w-xs">{f.name}</span>
                <span className="text-xs text-muted-foreground ml-3 shrink-0">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-3 text-destructive hover:text-destructive/80 shrink-0"
                  aria-label={`Remove ${f.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {errors.files && (
          <p className="text-xs text-destructive">{errors.files}</p>
        )}
      </div>

      {/* Blind review toggle */}
      <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isBlindReview}
            onClick={() => setIsBlindReview((v) => !v)}
            className={[
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
              isBlindReview ? "bg-primary" : "bg-muted-foreground/30",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
                isBlindReview ? "translate-x-[18px]" : "translate-x-[3px]",
              ].join(" ")}
            />
          </button>
          <span className="text-sm font-medium">Enable blind review</span>
        </label>
        <p className="text-xs text-muted-foreground pl-12">
          Reviewers won't see who submitted this idea until a final decision is
          made.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={savingDraft || submitting}
          onClick={handleSaveAsDraft}
        >
          {savingDraft ? "Saving…" : "Save as Draft"}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={submitting || savingDraft}
        >
          {submitting ? "Submitting…" : "Submit Idea"}
        </Button>
      </div>
    </form>
  );
}
