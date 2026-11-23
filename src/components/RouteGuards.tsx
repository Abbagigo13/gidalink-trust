import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import type { AccountRole } from "../types";

export function FullScreenLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="dash-loader" role="status" aria-live="polite">
      <span className="dash-spinner" />
      {label}...
    </div>
  );
}

/** Requires a signed-in user. Redirects to /auth and remembers where they were going. */
export function RequireAuth() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader label="Checking your session" />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  if (!profile) {
    return (
      <div className="dash-loader">
        We could not load your profile. Refresh the page or sign in again.
      </div>
    );
  }

  return <Outlet />;
}

/** Frontend gate for role-specific pages. The database enforces the same rules. */
export function RequireRole({ roles }: { roles: AccountRole[] }) {
  const { role, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!role || !roles.includes(role)) {
    return (
      <div className="dash-card dash-empty" data-testid="forbidden">
        <h2>You do not have access to this page</h2>
        <p>
          Your account role ({role ?? "unknown"}) cannot open this area. Access
          is also enforced by the database.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
