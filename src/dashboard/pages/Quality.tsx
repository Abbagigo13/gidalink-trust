import { useState } from "react";
import { Check, ClipboardCopy, ExternalLink, X } from "lucide-react";
import { useAsync } from "../useAsync";
import { formatDateTime } from "../format";
import { EmptyState, Loading, PageHeader } from "../ui";

type KaneStep = { step: number; status: string; remark: string };
type KaneScenario = {
  id: string;
  title: string;
  tags: string[];
  objective: string;
  status: string;
  durationSec: number;
  summary: string;
  steps: KaneStep[];
  failure: { step: number | null; remark: string } | null;
  testUrl: string | null;
};
type KaneReport = {
  generatedAt: string;
  baseUrl: string;
  kaneVersion: string;
  mode: string;
  totals: { passed: number; failed: number; error: number };
  scenarios: KaneScenario[];
};
type HistoryEntry = {
  generatedAt: string;
  mode: string;
  totals: { passed: number; failed: number; error: number };
  failedIds: string[];
};

async function loadJson<T>(path: string): Promise<T | null> {
  const res = await fetch(path, { cache: "no-store" });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.includes("json")) return null;
  return (await res.json()) as T;
}

function fixPrompt(report: KaneReport): string {
  const bad = report.scenarios.filter((s) => s.status !== "passed");
  if (bad.length === 0) return "";
  return [
    "Kane ran real browser tests against this app and these scenarios failed.",
    "Fix the application so each expectation is true, then re-run `npm run kane -- --only " +
      bad.map((s) => s.id).join(",") + "` until they pass.",
    "",
    ...bad.map(
      (s) =>
        `${s.id} ${s.title}\n  Expected: ${s.objective}\n  Failed at step ${s.failure?.step ?? "?"}: ${s.failure?.remark ?? "no detail"}${s.testUrl ? `\n  Evidence: ${s.testUrl}` : ""}`
    ),
  ].join("\n");
}

export default function Quality() {
  const report = useAsync(() => loadJson<KaneReport>("/kane-report.json"), "report");
  const history = useAsync(() => loadJson<HistoryEntry[]>("/kane-history.json"), "history");
  const [copied, setCopied] = useState(false);

  const data = report.data;
  const prompt = data ? fixPrompt(data) : "";

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <PageHeader kicker="VERIFIED WITH KANE" title={<>Quality <em>report.</em></>}>
        {prompt && (
          <button className="btn-ghost" onClick={copy} data-testid="copy-fix-prompt">
            <ClipboardCopy size={15} /> {copied ? "Copied" : "Copy fix prompt for my agent"}
          </button>
        )}
      </PageHeader>

      {report.loading && <Loading />}

      {!report.loading && !data && (
        <EmptyState
          title="No Kane run yet"
          body="Start the app, then run `npm run kane:smoke` in your terminal. Results from the real browser run appear here. See docs/KANE.md for setup."
        />
      )}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat"><span>Passed</span><strong className="kane-pass">{data.totals.passed}</strong></div>
            <div className="stat"><span>Failed</span><strong className="kane-fail">{data.totals.failed}</strong></div>
            <div className="stat"><span>Errored</span><strong>{data.totals.error}</strong></div>
            <div className="stat"><span>Last run</span><strong style={{ fontSize: 18 }}>{formatDateTime(data.generatedAt)}</strong></div>
          </div>
          <p className="hint" style={{ marginBottom: 16 }}>
            kane-cli {data.kaneVersion} · {data.mode} run against {data.baseUrl}
          </p>

          <div className="listing-rows">
            {data.scenarios.map((s) => (
              <details className="dash-card" key={s.id} data-testid="kane-scenario">
                <summary style={{ cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
                  {s.status === "passed" ? <Check size={16} className="kane-pass" /> : <X size={16} className="kane-fail" />}
                  <strong>{s.id}</strong> {s.title}
                  <span className="hint" style={{ marginLeft: "auto" }}>{s.durationSec}s</span>
                </summary>
                <div className="stack" style={{ marginTop: 14 }}>
                  {s.summary && <p style={{ margin: 0 }}>{s.summary}</p>}
                  {s.failure && (
                    <div className="form-alert form-alert-error">
                      Step {s.failure.step ?? "?"}: {s.failure.remark}
                    </div>
                  )}
                  <ol className="hint" style={{ margin: 0, paddingLeft: 20 }}>
                    {s.steps.map((st) => (
                      <li key={st.step}>{st.status}: {st.remark}</li>
                    ))}
                  </ol>
                  {s.testUrl && (
                    <a className="btn-ghost" href={s.testUrl} target="_blank" rel="noopener noreferrer" style={{ width: "fit-content" }}>
                      <ExternalLink size={14} /> Open Kane evidence
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>

          {history.data && history.data.length > 1 && (
            <section className="dash-card table-wrap" style={{ marginTop: 24 }}>
              <h2>Run history</h2>
              <table className="dash-table">
                <thead><tr><th>When</th><th>Mode</th><th>Passed</th><th>Failed</th><th>Failing</th></tr></thead>
                <tbody>
                  {[...history.data].reverse().map((h) => (
                    <tr key={h.generatedAt}>
                      <td className="num">{formatDateTime(h.generatedAt)}</td>
                      <td>{h.mode}</td>
                      <td className="num">{h.totals.passed}</td>
                      <td className="num">{h.totals.failed + h.totals.error}</td>
                      <td>{h.failedIds.join(", ") || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </>
  );
}
