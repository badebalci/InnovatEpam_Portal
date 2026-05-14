import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/authApi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fields, setFields] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.email || !fields.password) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data = await authApi.login(fields);
      login(data.accessToken, data.user);
      if (data.user.role === "AdminEvaluator") {
        navigate("/admin");
      } else {
        navigate("/my-ideas");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Login failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-1">
        <Label htmlFor="email">EPAM Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@epam.com"
          value={fields.email}
          onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
          autoComplete="username"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={fields.password}
          onChange={(e) =>
            setFields((f) => ({ ...f, password: e.target.value }))
          }
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
