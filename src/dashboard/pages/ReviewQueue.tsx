import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { getEvidenceUrl, getSubmissions } from "../../services/listings";
import { getReviewQueue, reviewProperty } from "../../services/workflow";
import { errorMessage, useAsync } from "../useAsync";
import { formatDate, listingTypeLabel, naira } from "../format";
import { EmptyState, ErrorNote, Loading, PageHeader } from "../ui";
import type { PropertyRow } from "../../types";

export default function ReviewQueue() {
  const queue = useAsync(getReviewQueue, "queue");
  const [selected, setSelected] = useState<PropertyRow | null>(null);

  return (
    <>
      <PageHeader kicker="TRUST ENGINE" title={<>Verification <em>queue.</em></>} />
      <ErrorNote message={queue.error} />
      {queue.loading && <Loading />}
      {queue.data && queue.data.length === 0 && (
        <EmptyState
          title="The queue is clear"
          body="Listings submitted for review will appear here, oldest first."
        />
      )}

      {queue.data && queue.data.length > 0 && (
        <div className="two-col">
          <div className="listing-rows">
            {queue.data.map((row) => (
              <button
                key={row.id}
                className="dash-card listing-row"
                style={{ textAlign: "left", outline: selected?.id === row.id ? "2px solid var(--green)" : undefined }}
                onClick={() => setSelected(row)}
                data-testid="queue-row"
              >
                {row.image_urls[0] ? <img className="listing-thumb" src={row.image_urls[0]} alt="" /> : <div className="listing-thumb" />}
                <div>
                  <h3>{row.title}</h3>
                  <p>{row.city}, {row.state} · <span className="num">{naira(row.price_ngn)}</span></p>
                  <p>Submitted {formatDate(row.updated_at)}</p>
                </div>
              </button>
            ))}
          </div>

          {selected ? (
            <ReviewPanel
              key={selected.id}
              row={selected}
              onDecided={() => {
                setSelected(null);
                queue.reload();
              }}
            />
          ) : (
            <div className="dash-card dash-empty">
              <h2>Select a listing</h2>
              <p>Open one from the queue to read its evidence and record a decision.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ReviewPanel({ row, onDecided }: { row: PropertyRow; onDecided: () => void }) {
  const { user } = useAuth();
  const submissions = useAsync(() => getSubmissions(row.id), row.id);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const own = row.owner_id === user?.id;

  const openEvidence = async (path: string) => {
    setError("");
    try {
      window.open(await getEvidenceUrl(path), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const decide = async (decision: "approve" | "reject") => {
    setError("");
    if (decision === "reject" && !notes.trim()) {
      setError("Write the reason for rejection so the owner can fix it.");
      return;
    }
    setBusy(true);
    try {
      await reviewProperty(row.id, decision, notes.trim());
      onDecided();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <section className="dash-card stack" data-testid="review-panel">
      <h2>{row.title}</h2>
      <dl className="kv">
        <dt>Type</dt><dd>{listingTypeLabel[row.listing_type]}</dd>
        <dt>Price</dt><dd className="num">{naira(row.price_ngn)}</dd>
        <dt>Address</dt><dd>{row.address}, {row.city}, {row.state}</dd>
        <dt>Description</dt><dd>{row.description}</dd>
      </dl>

      <div>
        <strong>Evidence</strong>
        {submissions.loading && <Loading />}
        {submissions.data?.filter((s) => s.status === "submitted").map((s) => (
          <p key={s.id} style={{ display: "flex", gap: 10, alignItems: "center", margin: "8px 0" }}>
            <button className="btn-ghost" onClick={() => openEvidence(s.storage_path)}>
              <ExternalLink size={14} /> {s.document_type}
            </button>
            <span className="hint">{s.notes || formatDate(s.created_at)}</span>
          </p>
        ))}
        {submissions.data && !submissions.data.some((s) => s.status === "submitted") && (
          <p className="hint">No outstanding evidence.</p>
        )}
      </div>

      <ErrorNote message={error || submissions.error} />

      {own ? (
        <div className="form-alert form-alert-error">
          You own this listing, so another verifier must review it.
        </div>
      ) : (
        <div className="dash-form">
          <label>
            Decision notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Required when rejecting" />
          </label>
          <div className="row-actions">
            <button className="primary-button" disabled={busy} onClick={() => decide("approve")} data-testid="approve">
              Approve and verify
            </button>
            <button className="btn-danger" disabled={busy} onClick={() => decide("reject")} data-testid="reject">
              Reject
            </button>
          </div>
          <p className="hint">
            A verified badge records that submitted evidence was reviewed. It is not proof of legal ownership.
          </p>
        </div>
      )}
    </section>
  );
}
