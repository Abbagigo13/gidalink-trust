export type AccountRole = "buyer" | "landlord" | "agent" | "verifier" | "admin";
export type DbListingType = "rent" | "sale" | "land";
export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "verified"
  | "rejected"
  | "suspended";
export type InspectionStatus =
  | "requested"
  | "accepted"
  | "declined"
  | "completed"
  | "cancelled";
export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";
export type VerificationStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: AccountRole;
  created_at: string;
};

/** Row of the private `properties` table (owner, staff or accepted-inspection holders). */
export type PropertyRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  listing_type: DbListingType;
  price_ngn: number | string;
  price_period: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | string | null;
  address: string;
  neighbourhood: string | null;
  city: string;
  state: string;
  country: string;
  image_urls: string[];
  features: string[];
  status: PropertyStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Row of the `public_properties` view (no address, no owner). */
export type PublicPropertyRow = Omit<
  PropertyRow,
  "owner_id" | "address" | "updated_at"
>;

export type VerificationSubmission = {
  id: string;
  property_id: string;
  submitted_by: string;
  document_type: string;
  storage_path: string;
  notes: string | null;
  status: VerificationStatus;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type InspectionRequest = {
  id: string;
  property_id: string;
  requester_id: string;
  preferred_at: string;
  message: string | null;
  status: InspectionStatus;
  created_at: string;
};

export type PropertyReport = {
  id: string;
  property_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  assigned_to: string | null;
  resolution_note: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  property_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
