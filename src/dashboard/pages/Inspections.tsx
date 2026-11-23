import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import { getInspections, setInspectionStatus } from "../../services/workflow";
import { errorMessage, useAsync } from "../useAsync";
import { formatDateTime } from "../format";
import { EmptyState, ErrorNote, Loading, PageHeader } from "../ui";
import type { InspectionStatus } from "../../types";

export default function Inspections() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data, error, loading, reload } = useAsync(getInspections, userId);
  const [actionError, setActionError] = useState("");

  const change = async (id: string, status: InspectionStatus) => {
    setActionError("");
    try {
      await setInspectionStatus(id, status);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader kicker="INSPECTIONS" title={<>Viewings & <em>requests.</em></>} />
      <ErrorNote message={error || actionError} />
      {loading && <Loading />}
      {data && data.length === 0 && (
        <EmptyState
          title="No inspection requests"
          body="Open any property on the home page and choose Request an inspection. Requests on your own listings appear here for you to accept or decline."
        />
      )}
      {data && data.length > 0 && (
        <div className="dash-card table-wrap">
          <table className="dash-table" data-testid="inspection-table">
            <thead>
              <tr><th>Property</th><th>Preferred time</th><th>Message</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const mine = r.requester_id === userId;
                return (
                  <tr key={r.id}>
                    <td><strong>{r.property_title}</strong><br /><span className="hint">{r.property_city}{mine ? " · You requested" : " · Request received"}</span></td>
                    <td className="num">{formatDateTime(r.preferred_at)}</td>
                    <td>{r.message || "-"}</td>
                    <td data-testid="inspection-status">{r.status}</td>
                    <td>
                      <div className="row-actions">
                        {!mine && r.status === "requested" && (
                          <>
                            <button className="btn-ghost" onClick={() => change(r.id, "accepted")}>Accept</button>
                            <button className="btn-danger" onClick={() => change(r.id, "declined")}>Decline</button>
                          </>
                        )}
                        {!mine && r.status === "accepted" && (
                          <button className="btn-ghost" onClick={() => change(r.id, "completed")}>Mark completed</button>
                        )}
                        {mine && (r.status === "requested" || r.status === "accepted") && (
                          <button className="btn-danger" onClick={() => change(r.id, "cancelled")}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
