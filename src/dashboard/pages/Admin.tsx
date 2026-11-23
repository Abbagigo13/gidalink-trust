import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import { getAuditLogs, getProfiles, setUserRole } from "../../services/workflow";
import { errorMessage, useAsync } from "../useAsync";
import { formatDateTime } from "../format";
import { ErrorNote, Loading, PageHeader } from "../ui";
import type { AccountRole } from "../../types";

const roles: AccountRole[] = ["buyer", "landlord", "agent", "verifier", "admin"];

export default function Admin() {
  const { user } = useAuth();
  const profiles = useAsync(getProfiles, "profiles");
  const logs = useAsync(getAuditLogs, "audit");
  const [error, setError] = useState("");

  const change = async (id: string, role: AccountRole) => {
    setError("");
    try {
      await setUserRole(id, role);
      profiles.reload();
      logs.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader kicker="ADMINISTRATION" title={<>Users & <em>audit trail.</em></>} />
      <ErrorNote message={error || profiles.error || logs.error} />

      <section className="dash-card table-wrap" style={{ marginBottom: 24 }}>
        <h2>Users</h2>
        {profiles.loading && <Loading />}
        {profiles.data && (
          <table className="dash-table" data-testid="user-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Joined</th><th>Role</th></tr></thead>
            <tbody>
              {profiles.data.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name || "Unnamed"}{p.id === user?.id ? " (you)" : ""}</td>
                  <td>{p.phone || "-"}</td>
                  <td className="num">{formatDateTime(p.created_at)}</td>
                  <td>
                    <select
                      aria-label={`Role for ${p.full_name || p.id}`}
                      value={p.role}
                      disabled={p.id === user?.id}
                      onChange={(e) => change(p.id, e.target.value as AccountRole)}
                    >
                      {roles.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dash-card table-wrap">
        <h2>Audit log</h2>
        {logs.loading && <Loading />}
        {logs.data && logs.data.length === 0 && <p className="hint">No recorded actions yet.</p>}
        {logs.data && logs.data.length > 0 && (
          <table className="dash-table" data-testid="audit-table">
            <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
            <tbody>
              {logs.data.map((l) => (
                <tr key={l.id}>
                  <td className="num">{formatDateTime(l.created_at)}</td>
                  <td>{l.action}</td>
                  <td className="mono">{l.entity_type}</td>
                  <td className="mono">{JSON.stringify(l.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
