import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/authApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function RegisterForm() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    email: "",
    fullName: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const errs: Record<string, string[]> = {};
    if (!fields.email.endsWith("@epam.com"))
      errs.email = ["Email must be an @epam.com address."];
    if (!fields.fullName.trim()) errs.fullName = ["Full name is required."];
    if (
      fields.password.length < 8 ||
      !/[A-Z]/.test(fields.password) ||
      !/\d/.test(fields.password)
    )
      errs.password = [
        "Password must be at least 8 characters and contain an uppercase letter and a number.",
      ];
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
    try {
      await authApi.register(fields);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const resp = (
        err as {
          response?: {
            data?: { error?: string; errors?: Record<string, string[]> };
          };
        }
      )?.response?.data;
      if (resp?.errors) setErrors(resp.errors);
      else setGlobalError(resp?.error ?? "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <p className="text-sm text-green-600 font-medium">
          Registration successful. Redirecting to login…
        </p>
      )}
      {globalError && <p className="text-sm text-destructive">{globalError}</p>}

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
        {errors.email?.map((e) => (
          <p key={e} className="text-xs text-destructive">
            {e}
          </p>
        ))}
      </div>

      <div className="space-y-1">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Jane Doe"
          value={fields.fullName}
          onChange={(e) =>
            setFields((f) => ({ ...f, fullName: e.target.value }))
          }
          autoComplete="name"
        />
        {errors.fullName?.map((e) => (
          <p key={e} className="text-xs text-destructive">
            {e}
          </p>
        ))}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={fields.password}
          onChange={(e) =>
            setFields((f) => ({ ...f, password: e.target.value }))
          }
          autoComplete="new-password"
        />
        {errors.password?.map((e) => (
          <p key={e} className="text-xs text-destructive">
            {e}
          </p>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
