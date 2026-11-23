import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flag } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { requestInspection, submitReport } from "../services/workflow";
import { errorMessage } from "../dashboard/useAsync";
import "../dashboard/dashboard.css";

type Props = {
  propertyId: string;
  source: "database" | "demo";
};

const reasons = [
  "Fake or misleading photographs",
  "Agent does not represent the owner",
  "Duplicate listing with a different price",
  "Asked to pay before inspection",
  "Other",
];

function minLocalDateTime(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/** Inspection and report actions shown inside the property detail dialog. */
export default function ListingActions({ propertyId, source }: Props) {
  const { user } = useAuth();
  const [dialog, setDialog] = useState<"inspection" | "report" | null>(null);

  if (source === "demo") {
    return (
      <div className="detail-disclaimer" data-testid="demo-actions-note">
        This is a sample listing. Inspection requests and reports are only
        available on live verified listings.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="detail-actions-row">
        <Link
          to={`/auth?next=${encodeURIComponent("/")}`}
          className="primary-button detail-action"
          data-testid="signin-to-inspect"
        >
          Sign in to request an inspection <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="detail-actions-row">
        <button
          className="primary-button detail-action"
          onClick={() => setDialog("inspection")}
          data-testid="request-inspection"
        >
          Request an inspection <ArrowUpRight size={16} />
        </button>
        <button className="btn-ghost" onClick={() => setDialog("report")} data-testid="report-listing">
          <Flag size={15} /> Report this listing
        </button>
      </div>

      {dialog === "inspection" && (
        <InspectionDialog propertyId={propertyId} userId={user.id} onClose={() => setDialog(null)} />
      )}
      {dialog === "report" && (
        <ReportDialog propertyId={propertyId} userId={user.id} onClose={() => setDialog(null)} />
      )}
    </>
  );
}

function Shell({ title, hint, onClose, children }: {
  title: string; hint: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="mini-backdrop" role="presentation" onClick={onClose}>
      <div className="mini-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="hint">{hint}</p>
        {children}
      </div>
    </div>
  );
}

function InspectionDialog({ propertyId, userId, onClose }: { propertyId: string; userId: string; onClose: () => void }) {
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!when || new Date(when).getTime() <= Date.now()) {
      setError("Choose a date and time in the future.");
      return;
    }
    setBusy(true);
    try {
      await requestInspection({
        property_id: propertyId,
        requester_id: userId,
        preferred_at: new Date(when).toISOString(),
        message: message.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Request an inspection" hint="The owner or agent will accept or decline. You can cancel from your dashboard." onClose={onClose}>
      {done ? (
        <div className="stack">
          <div className="form-alert form-alert-ok" role="status">Request sent. Track it under Inspections in your dashboard.</div>
          <Link to="/app/inspections" className="primary-button">Open my inspections</Link>
        </div>
      ) : (
        <form className="dash-form" onSubmit={submit} noValidate>
          {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}
          <label>
            Preferred date and time
            <input type="datetime-local" min={minLocalDateTime()} value={when} onChange={(e) => setWhen(e.target.value)} />
          </label>
          <label>
            Message (optional)
            <textarea value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <div className="row-actions">
            <button className="primary-button" disabled={busy}>{busy ? "Sending..." : "Send request"}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      )}
    </Shell>
  );
}

function ReportDialog({ propertyId, userId, onClose }: { propertyId: string; userId: string; onClose: () => void }) {
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await submitReport({ property_id: propertyId, reporter_id: userId, reason, details: details.trim() });
      setDone(true);
    } catch (err) {
      const text = errorMessage(err);
      setError(
        text.includes("duplicate") || text.includes("unique")
          ? "You already have an open report on this listing."
          : text
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Report this listing" hint="Reports go to the GidaLink team. Do not include passwords or bank details." onClose={onClose}>
      {done ? (
        <div className="form-alert form-alert-ok" role="status">Thank you. The team will investigate.</div>
      ) : (
        <form className="dash-form" onSubmit={submit} noValidate>
          {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}
          <label>
            Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {reasons.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label>
            Details (optional)
            <textarea value={details} maxLength={1000} onChange={(e) => setDetails(e.target.value)} />
          </label>
          <div className="row-actions">
            <button className="primary-button" disabled={busy}>{busy ? "Sending..." : "Submit report"}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      )}
    </Shell>
  );
}
