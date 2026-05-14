import { useEffect, useState } from "react";
import { useIdeas } from "../hooks/useIdeas";
import { evaluationsApi } from "../services/evaluationsApi";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { IdeaStatusBadge } from "../components/ideas/IdeaStatusBadge";
import { EvaluationDialog } from "../components/ideas/EvaluationDialog";
import { PaginationControls } from "../components/ui/PaginationControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Link } from "react-router-dom";
import type { IdeaSummary } from "../types";
import {
  IDEA_CATEGORIES,
  IDEA_STATUSES,
  DEFAULT_PAGE_SIZE,
} from "../lib/constants";

export function AdminDashboard() {
  const {
    ideas,
    totalCount,
    page,
    isLoading,
    search,
    category,
    status,
    fetchIdeas,
    setPage,
    setSearch,
    setCategory,
    setStatus,
    refresh,
  } = useIdeas();

  const [searchInput, setSearchInput] = useState("");
  const [evalIdea, setEvalIdea] = useState<IdeaSummary | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  }, [fetchIdeas]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setStatus("");
  }

  async function handleStartReview(idea: IdeaSummary) {
    setActionError(null);
    try {
      await evaluationsApi.startReview(idea.id);
      refresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Could not start review.";
      setActionError(msg);
    }
  }

  const hasFilters = search || category || status;

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {actionError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
            {actionError}
          </p>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Search ideas…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
          </form>

          <Select
            value={category || "all"}
            onValueChange={(v) => setCategory(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {IDEA_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status || "all"}
            onValueChange={(v) => setStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {IDEA_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "UnderReview" ? "Under Review" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium">No ideas found</p>
            {hasFilters && (
              <p className="mt-1 text-sm">Try clearing the filter.</p>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ideas.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell>
                      <Link
                        to={`/ideas/${idea.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {idea.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {idea.submitterName}
                    </TableCell>
                    <TableCell>{idea.category}</TableCell>
                    <TableCell>
                      <IdeaStatusBadge status={idea.status} />
                    </TableCell>
                    <TableCell>
                      {idea.overallScore != null ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          ★ {idea.overallScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {idea.status === "Submitted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartReview(idea)}
                        >
                          Start Review
                        </Button>
                      )}
                      {idea.status === "UnderReview" && (
                        <Button size="sm" onClick={() => setEvalIdea(idea)}>
                          Evaluate
                        </Button>
                      )}
                      {idea.status === "FinalReview" && (
                        <Button size="sm" onClick={() => setEvalIdea(idea)}>
                          Evaluate &amp; Decide
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationControls
              page={page}
              totalCount={totalCount}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}

        <EvaluationDialog
          idea={evalIdea}
          open={!!evalIdea}
          onClose={() => setEvalIdea(null)}
          onSuccess={() => {
            setEvalIdea(null);
            refresh();
          }}
        />
      </div>
    </AppShell>
  );
}
