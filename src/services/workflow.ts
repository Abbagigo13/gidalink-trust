import { supabase } from "../lib/supabase";
import type {
  AuditLog,
  InspectionRequest,
  InspectionStatus,
  Profile,
  PropertyReport,
  PropertyRow,
  ReportStatus,
  AccountRole,
} from "../types";

/* ---------- Verifier queue ---------- */

export async function getReviewQueue(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "pending_review")
    .order("updated_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PropertyRow[];
}

export async function reviewProperty(
  id: string,
  decision: "approve" | "reject",
  notes: string
): Promise<void> {
  const { error } = await supabase.rpc("review_property", {
    p_property: id,
    p_decision: decision,
    p_notes: notes || null,
  });
  if (error) throw error;
}

export async function suspendProperty(id: string, reason: string) {
  const { error } = await supabase.rpc("suspend_property", {
    p_property: id,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function reinstateProperty(id: string) {
  const { error } = await supabase.rpc("reinstate_property", { p_property: id });
  if (error) throw error;
}

export async function getAllProperties(): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as PropertyRow[];
}

/* ---------- Inspections ---------- */

export type InspectionWithProperty = InspectionRequest & {
  property_title: string;
  property_city: string;
};

export async function requestInspection(input: {
  property_id: string;
  requester_id: string;
  preferred_at: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("inspection_requests").insert({
    property_id: input.property_id,
    requester_id: input.requester_id,
    preferred_at: input.preferred_at,
    message: input.message || null,
    status: "requested",
  });
  if (error) throw error;
}

export async function getInspections(): Promise<InspectionWithProperty[]> {
  const { data, error } = await supabase
    .from("inspection_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as InspectionRequest[];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((r) => r.property_id))];
  const { data: props, error: propError } = await supabase
    .from("public_properties")
    .select("id,title,city")
    .in("id", ids);
  if (propError) throw propError;
  const byId = new Map(
    (props ?? []).map((p) => [p.id as string, p as { title: string; city: string }])
  );

  return rows.map((r) => ({
    ...r,
    property_title: byId.get(r.property_id)?.title ?? "Listing no longer public",
    property_city: byId.get(r.property_id)?.city ?? "",
  }));
}

export async function setInspectionStatus(
  id: string,
  status: InspectionStatus
): Promise<void> {
  const { error } = await supabase.rpc("set_inspection_status", {
    p_request: id,
    p_status: status,
  });
  if (error) throw error;
}

/* ---------- Reports ---------- */

export async function submitReport(input: {
  property_id: string;
  reporter_id: string;
  reason: string;
  details: string;
}): Promise<void> {
  const { error } = await supabase.from("property_reports").insert({
    property_id: input.property_id,
    reporter_id: input.reporter_id,
    reason: input.reason,
    details: input.details || null,
    status: "open",
  });
  if (error) throw error;
}

export async function getReports(): Promise<PropertyReport[]> {
  const { data, error } = await supabase
    .from("property_reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PropertyReport[];
}

export async function moderateReport(
  id: string,
  status: ReportStatus,
  note: string
): Promise<void> {
  const { error } = await supabase.rpc("moderate_report", {
    p_report: id,
    p_status: status,
    p_note: note || null,
  });
  if (error) throw error;
}

/* ---------- Admin ---------- */

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function setUserRole(userId: string, role: AccountRole) {
  const { error } = await supabase.rpc("set_user_role", {
    p_user: userId,
    p_role: role,
  });
  if (error) throw error;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as AuditLog[];
}

/* ---------- Favourites ---------- */

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.property_id as string);
}

export async function addFavorite(userId: string, propertyId: string) {
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, property_id: propertyId });
  if (error && error.code !== "23505") throw error;
}

export async function removeFavorite(userId: string, propertyId: string) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("property_id", propertyId);
  if (error) throw error;
}
