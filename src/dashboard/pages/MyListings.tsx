import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import {
  deleteListing,
  getMyListings,
  submitForReview,
  withdrawListing,
} from "../../services/listings";
import { errorMessage, useAsync } from "../useAsync";
import { naira } from "../format";
import { EmptyState, ErrorNote, Loading, PageHeader, StatusBadge } from "../ui";
import type { PropertyRow } from "../../types";

export default function MyListings() {
  const { user, role } = useAuth();
  const userId = user?.id ?? "";
  const { data, error, loading, reload } = useAsync(
    () => getMyListings(userId),
    userId
  );
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");

  const canCreate = role === "landlord" || role === "agent";

  const run = async (id: string, task: () => Promise<void>) => {
    setBusy(id);
    setActionError("");
    try {
      await task();
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy("");
    }
  };

  const confirmDelete = (row: PropertyRow) => {
    if (window.confirm(`Delete the draft "${row.title}"? This cannot be undone.`)) {
      void run(row.id, () => deleteListing(row.id));
    }
  };

  return (
    <>
      <PageHeader kicker="LISTINGS" title={<>My <em>properties.</em></>}>
        {canCreate && (
          <Link to="/app/listings/new" className="primary-button" data-testid="new-listing">
            <Plus size={16} /> New listing
          </Link>
        )}
      </PageHeader>

      <ErrorNote message={error || actionError} />
      {loading && <Loading />}

      {data && data.length === 0 && (
        <EmptyState
          title="No listings yet"
          body={
            canCreate
              ? "Create your first listing, upload photographs and ownership evidence, then submit it for review."
              : "Only landlord and agent accounts can create listings."
          }
        />
      )}

      <div className="listing-rows">
        {data?.map((row) => (
          <article className="dash-card listing-row" key={row.id} data-testid="listing-row">
            {row.image_urls[0] ? (
              <img className="listing-thumb" src={row.image_urls[0]} alt="" />
            ) : (
              <div className="listing-thumb" />
            )}
            <div>
              <h3>{row.title}</h3>
              <p>
                {[row.neighbourhood, row.city].filter(Boolean).join(", ")} ·{" "}
                <span className="num">{naira(row.price_ngn)}</span>
              </p>
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={row.status} />
              </div>
            </div>
            <div className="row-actions">
              {(row.status === "draft" || row.status === "rejected") && (
                <>
                  <Link to={`/app/listings/${row.id}`} className="btn-ghost">
                    {row.status === "rejected" ? "Fix and resubmit" : "Edit"}
                  </Link>
                  <button
                    className="btn-ghost"
                    disabled={busy === row.id}
                    onClick={() => run(row.id, () => submitForReview(row.id))}
                  >
                    Submit for review
                  </button>
                </>
              )}
              {row.status === "pending_review" && (
                <button
                  className="btn-ghost"
                  disabled={busy === row.id}
                  onClick={() => run(row.id, () => withdrawListing(row.id))}
                >
                  Withdraw
                </button>
              )}
              {row.status === "draft" && (
                <button className="btn-danger" disabled={busy === row.id} onClick={() => confirmDelete(row)}>
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
