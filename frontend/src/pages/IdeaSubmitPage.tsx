import { AppShell } from "../components/layout/AppShell";
import { IdeaSubmitForm } from "../components/forms/IdeaSubmitForm";

export function IdeaSubmitPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Submit a New Idea</h1>
        <IdeaSubmitForm />
      </div>
    </AppShell>
  );
}
