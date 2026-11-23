import type { ReactNode } from "react";
import { statusLabel } from "./format";
import type { PropertyStatus } from "../types";

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span className={`badge badge-${status}`} data-testid="status-badge">
      {statusLabel[status]}
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h1>{title}</h1>
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="dash-card dash-empty">
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="form-alert form-alert-error" role="alert">
      {message}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="dash-loader inline" role="status">
      <span className="dash-spinner" />
      {label}...
    </div>
  );
}
