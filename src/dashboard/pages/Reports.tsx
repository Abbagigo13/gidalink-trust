import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import {
  getAllProperties,
  getReports,
  moderateReport,
  suspendProperty,
  reinstateProperty,
} from "../../services/workflow";
import { errorMessage, useAsync } from "../useAsync";
import { formatDate } from "../format";
import { EmptyState, ErrorNote, Loading, PageHeader, StatusBadge } from "../ui";
import type { PropertyReport, PropertyStatus, ReportStatus } from "../../types";

export default function Reports() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const reports = useAsync(getReports, "reports");
  const properties = useAsync(getAllProperties, "all-properties");
  const [error, setError] = useState("");

  const titleOf = (id: string) =>
    properties.data?.find((p) => p.id === id)?.title ?? "Listing";
  const statusOf = (id: string) => properties.data?.find((p) => p.id === id)?.status;

  const act = async (task: () => Promise<void>) => {
    setError("");
    try {
      await task();
      reports.reload();
      properties.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader kicker="MARKETPLACE SAFETY" title={<>Suspicious <em>reports.</em></>} />
      <p className="hint" style={{ marginTop: -12, marginBottom: 20 }}>
        {isAdmin
          ? "You can investigate, resolve or dismiss reports and suspend listings."
          : "Verifiers can read reports. Only admins can moderate them."}
      </p>
      <ErrorNote message={error || reports.error} />
      {reports.loading && <Loading />}
      {reports.data && reports.data.length === 0 && (
        <EmptyState title="No reports" body="Reports submitted from listing pages appear here." />
      )}
      <div className="listing-rows">
        {reports.data?.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            title={titleOf(r.property_id)}
            listingStatus={statusOf(r.property_id)}
            isAdmin={isAdmin}
            onModerate={(status, note) => act(() => moderateReport(r.id, status, note))}
            onSuspend={(reason) => act(() => suspendProperty(r.property_id, reason))}
            onReinstate={() => act(() => reinstateProperty(r.property_id))}
          />
        ))}
      </div>
    </>
  );
}

function ReportCard({
  report, title, listingStatus, isAdmin, onModerate, onSuspend, onReinstate,
}: {
  report: PropertyReport;
  title: string;
  listingStatus: PropertyStatus | undefined;
  isAdmin: boolean;
  onModerate: (status: ReportStatus, note: string) => void;
  onSuspend: (reason: string) => void;
  onReinstate: () => void;
}) {
  const [note, setNote] = useState("");
  const closed = report.status === "resolved" || report.status === "dismissed";

  return (
    <article className="dash-card stack" data-testid="report-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong>{title}</strong>
          <p className="hint">{report.reason} · {formatDate(report.created_at)}</p>
        </div>
        <div className="row-actions">
          {listingStatus && <StatusBadge status={listingStatus} />}
          <span className="role-pill">{report.status}</span>
        </div>
      </div>
      {report.details && <p style={{ margin: 0 }}>{report.details}</p>}
      {report.resolution_note && <p className="hint">Resolution: {report.resolution_note}</p>}

      {isAdmin && !closed && (
        <div className="dash-form">
          <label>
            Note (required to resolve, dismiss or suspend)
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="row-actions">
            {report.status === "open" && (
              <button className="btn-ghost" onClick={() => onModerate("investigating", note)}>Start investigating</button>
            )}
            <button className="btn-ghost" onClick={() => onModerate("resolved", note)}>Resolve</button>
            <button className="btn-ghost" onClick={() => onModerate("dismissed", note)}>Dismiss</button>
            {(listingStatus === "verified" || listingStatus === "pending_review") && (
              <button className="btn-danger" onClick={() => onSuspend(note)}>Suspend listing</button>
            )}
          </div>
        </div>
      )}
      {isAdmin && listingStatus === "suspended" && (
        <div className="row-actions">
          <button className="btn-ghost" onClick={onReinstate}>Reinstate for review</button>
        </div>
      )}
    </article>
  );
}
