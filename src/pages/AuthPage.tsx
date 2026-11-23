import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/auth-context";
import {
  requestPasswordReset,
  signIn,
  signUp,
  type SignUpRole,
} from "../services/auth";
import "../dashboard/dashboard.css";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string(),
  role: z.enum(["buyer", "landlord", "agent"]),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type Mode = "login" | "register" | "reset";

const roleCopy: Record<SignUpRole, string> = {
  buyer: "Buyer or renter: search, save and request inspections",
  landlord: "Landlord: list properties you own",
  agent: "Agent: list properties for owners you represent",
};

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/app";
}

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (params.get("mode") as Mode | null) ?? "login";
  const next = safeNext(params.get("next"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const setMode = (value: Mode) => {
    const copy = new URLSearchParams(params);
    copy.set("mode", value);
    setParams(copy, { replace: true });
    setMessage("");
    setError("");
  };

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const register = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "buyer", phone: "" },
  });
  const reset = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email("Enter a valid email address") })),
  });

  if (!loading && user) return <Navigate to={next} replace />;

  const onLogin = login.handleSubmit(async (values) => {
    setError("");
    const { error: err } = await signIn(values.email, values.password);
    if (err) setError(err.message);
    else navigate(next, { replace: true });
  });

  const onRegister = register.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    const { data, error: err } = await signUp(
      values.email,
      values.password,
      values.fullName,
      values.role,
      values.phone
    );
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) navigate(next, { replace: true });
    else setMessage("Account created. Check your email to confirm, then sign in.");
  });

  const onReset = reset.handleSubmit(async (values) => {
    setError("");
    const { error: err } = await requestPasswordReset(values.email);
    if (err) setError(err.message);
    else setMessage("If that email has an account, a reset link is on its way.");
  });

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link to="/" className="auth-back">
          <ArrowLeft size={15} /> Back to GidaLink
        </Link>

        <div className="auth-brand">
          <span className="brand-symbol">G.</span>
          <span>
            gidalink<span className="brand-light">trust</span>
          </span>
        </div>

        <h1 data-testid="auth-title">
          {mode === "register"
            ? "Create your account"
            : mode === "reset"
              ? "Reset your password"
              : "Welcome back"}
        </h1>
        <p className="auth-lede">
          <ShieldCheck size={15} /> Every listing here follows an evidence-based
          review.
        </p>

        {error && (
          <div className="form-alert form-alert-error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="form-alert form-alert-ok" role="status">
            {message}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={onLogin} className="dash-form" noValidate>
            <label>
              Email
              <input type="email" autoComplete="email" {...login.register("email")} />
              <FieldError message={login.formState.errors.email?.message} />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                {...login.register("password")}
              />
              <FieldError message={login.formState.errors.password?.message} />
            </label>
            <button className="primary-button" disabled={login.formState.isSubmitting}>
              {login.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <div className="auth-links">
              <button type="button" onClick={() => setMode("reset")}>
                Forgot password?
              </button>
              <button type="button" onClick={() => setMode("register")}>
                Create an account
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={onRegister} className="dash-form" noValidate>
            <label>
              Full name
              <input autoComplete="name" {...register.register("fullName")} />
              <FieldError message={register.formState.errors.fullName?.message} />
            </label>
            <label>
              Email
              <input type="email" autoComplete="email" {...register.register("email")} />
              <FieldError message={register.formState.errors.email?.message} />
            </label>
            <label>
              Phone (optional)
              <input type="tel" autoComplete="tel" {...register.register("phone")} />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="new-password"
                {...register.register("password")}
              />
              <FieldError message={register.formState.errors.password?.message} />
            </label>
            <fieldset className="role-picker">
              <legend>I am joining as</legend>
              {(Object.keys(roleCopy) as SignUpRole[]).map((role) => (
                <label key={role} className="role-option">
                  <input type="radio" value={role} {...register.register("role")} />
                  <span>{roleCopy[role]}</span>
                </label>
              ))}
              <small>Verifier and admin access is granted by the GidaLink team only.</small>
            </fieldset>
            <button className="primary-button" disabled={register.formState.isSubmitting}>
              {register.formState.isSubmitting ? "Creating account..." : "Create account"}
            </button>
            <div className="auth-links">
              <button type="button" onClick={() => setMode("login")}>
                I already have an account
              </button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={onReset} className="dash-form" noValidate>
            <label>
              Email
              <input type="email" autoComplete="email" {...reset.register("email")} />
              <FieldError message={reset.formState.errors.email?.message} />
            </label>
            <button className="primary-button" disabled={reset.formState.isSubmitting}>
              Send reset link
            </button>
            <div className="auth-links">
              <button type="button" onClick={() => setMode("login")}>
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="field-error" role="alert">
      {message}
    </span>
  );
}
