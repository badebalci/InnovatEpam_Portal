import { useEffect, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/button";
import { settingsApi } from "../services/settingsApi";
import type { AppSettings } from "../types";

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsApi
      .getSettings()
      .then(setSettings)
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await settingsApi.updateSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {settings && !loading && (
          <div className="rounded-lg border bg-card p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-base mb-1">Blind Review</h2>
              <p className="text-sm text-muted-foreground mb-3">
                When enabled, AdminEvaluators cannot see who submitted an idea
                until a final decision (Accepted or Rejected) is made. This
                applies as the default for all new idea submissions.
              </p>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  role="switch"
                  aria-checked={settings.blindReviewDefault}
                  onClick={() =>
                    setSettings((s) =>
                      s
                        ? { ...s, blindReviewDefault: !s.blindReviewDefault }
                        : s,
                    )
                  }
                  className={[
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    settings.blindReviewDefault
                      ? "bg-primary"
                      : "bg-muted-foreground/30",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      settings.blindReviewDefault
                        ? "translate-x-6"
                        : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
                <span className="text-sm font-medium">
                  {settings.blindReviewDefault
                    ? "Blind review enabled by default"
                    : "Blind review disabled by default"}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Settings"}
              </Button>
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Saved!
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
