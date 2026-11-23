import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { supabase } from "../../lib/supabase";
import { useAsync } from "../useAsync";
import { ErrorNote, Loading, PageHeader } from "../ui";
import type { AccountRole } from "../../types";

type Counts = { label: string; value: number; to: string }[];

async function count(
  table: string,
  filter?: (q: ReturnType<typeof base>) => ReturnType<typeof base>
): Promise<number> {
  const query = filter ? filter(base(table)) : base(table);
  const { count: total, error } = await query;
  if (error) throw error;
  return total ?? 0;
}

function base(table: string) {
  return supabase.from(table).select("id", { count: "exact", head: true });
}

async function loadCounts(role: AccountRole, userId: string): Promise<Counts> {
  const out: Counts = [];

  if (role === "landlord" || role === "agent" || role === "admin") {
    const [drafts, pending, verified] = await Promise.all([
      count("properties", (q) => q.eq("owner_id", userId).eq("status", "draft")),
      count("properties", (q) => q.eq("owner_id", userId).eq("status", "pending_review")),
      count("properties", (q) => q.eq("owner_id", userId).eq("status", "verified")),
    ]);
    out.push(
      { label: "Draft listings", value: drafts, to: "/app/listings" },
      { label: "Awaiting review", value: pending, to: "/app/listings" },
      { label: "Verified listings", value: verified, to: "/app/listings" }
    );
  }

  if (role === "verifier" || role === "admin") {
    const [queue, reports] = await Promise.all([
      count("properties", (q) => q.eq("status", "pending_review")),
      count("property_reports", (q) => q.in("status", ["open", "investigating"])),
    ]);
    out.push(
      { label: "In verification queue", value: queue, to: "/app/review" },
      { label: "Open reports", value: reports, to: "/app/reports" }
    );
  }

  const [inspections, saved] = await Promise.all([
    count("inspection_requests", (q) => q.in("status", ["requested", "accepted"])),
    count("favorites", (q) => q.eq("user_id", userId)),
  ]);
  out.push(
    { label: "Active inspections", value: inspections, to: "/app/inspections" },
    { label: "Saved properties", value: saved, to: "/app/saved" }
  );

  return out;
}

const welcome: Record<AccountRole, string> = {
  buyer: "Search verified homes, save favourites and book inspections.",
  landlord: "Create listings, upload evidence and track verification.",
  agent: "Manage listings for the owners you represent.",
  verifier: "Review submitted evidence and record verification decisions.",
  admin: "Oversee users, listings, reports and the audit trail.",
};

export default function Overview() {
  const { user, profile, role } = useAuth();
  const userId = user?.id ?? "";
  const { data, error, loading } = useAsync(
    () => loadCounts(role ?? "buyer", userId),
    `${role}-${userId}`
  );

  return (
    <>
      <PageHeader
        kicker="YOUR DASHBOARD"
        title={
          <>
            Hello, <em>{profile?.full_name?.split(" ")[0] || "there"}.</em>
          </>
        }
      >
        <Link to="/" className="btn-ghost">
          Browse properties <ArrowUpRight size={15} />
        </Link>
      </PageHeader>

      <p className="hint" style={{ marginTop: -12, marginBottom: 24 }}>
        {role ? welcome[role] : ""}
      </p>

      <ErrorNote message={error} />
      {loading && <Loading />}

      {data && (
        <div className="stat-grid" data-testid="stat-grid">
          {data.map((item) => (
            <Link to={item.to} className="stat" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
