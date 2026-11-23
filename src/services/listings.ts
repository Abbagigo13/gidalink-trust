import { supabase } from "../lib/supabase";
import type {
  DbListingType,
  PropertyRow,
  VerificationSubmission,
} from "../types";

export type ListingInput = {
  title: string;
  description: string;
  listing_type: DbListingType;
  price_ngn: number;
  price_period: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  address: string;
  neighbourhood: string | null;
  city: string;
  state: string;
  features: string[];
};

export async function getMyListings(ownerId: string): Promise<PropertyRow[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PropertyRow[];
}

export async function getListing(id: string): Promise<PropertyRow | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as PropertyRow | null) ?? null;
}

export async function createListing(
  ownerId: string,
  input: ListingInput
): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...input, owner_id: ownerId, status: "draft" })
    .select("*")
    .single();
  if (error) throw error;
  return data as PropertyRow;
}

export async function updateListing(
  id: string,
  input: Partial<ListingInput> & { image_urls?: string[] }
): Promise<void> {
  const { error } = await supabase.from("properties").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

export async function submitForReview(id: string): Promise<void> {
  const { error } = await supabase.rpc("submit_property_for_review", {
    p_property: id,
  });
  if (error) throw error;
}

export async function withdrawListing(id: string): Promise<void> {
  const { error } = await supabase.rpc("withdraw_property", { p_property: id });
  if (error) throw error;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EVIDENCE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName && /^[a-z0-9]{2,5}$/.test(fromName) ? fromName : "bin";
}

export function validateUpload(
  file: File,
  kind: "image" | "evidence"
): string | null {
  const allowed = kind === "image" ? IMAGE_TYPES : EVIDENCE_TYPES;
  const maxBytes = kind === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!allowed.includes(file.type)) {
    return kind === "image"
      ? "Photos must be JPG, PNG or WebP."
      : "Documents must be PDF, JPG or PNG.";
  }
  if (file.size > maxBytes) {
    return `File is too large. The limit is ${maxBytes / 1024 / 1024} MB.`;
  }
  return null;
}

export async function uploadPropertyImage(
  ownerId: string,
  file: File
): Promise<string> {
  const problem = validateUpload(file, "image");
  if (problem) throw new Error(problem);

  const path = `${ownerId}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  return supabase.storage.from("property-images").getPublicUrl(path).data
    .publicUrl;
}

export async function uploadEvidence(
  ownerId: string,
  propertyId: string,
  file: File,
  documentType: string,
  notes: string
): Promise<void> {
  const problem = validateUpload(file, "evidence");
  if (problem) throw new Error(problem);

  const path = `${ownerId}/${propertyId}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error: uploadError } = await supabase.storage
    .from("verification-evidence")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("verification_submissions").insert({
    property_id: propertyId,
    submitted_by: ownerId,
    document_type: documentType,
    storage_path: path,
    notes: notes || null,
    status: "submitted",
  });
  if (error) {
    await supabase.storage.from("verification-evidence").remove([path]);
    throw error;
  }
}

export async function getSubmissions(
  propertyId: string
): Promise<VerificationSubmission[]> {
  const { data, error } = await supabase
    .from("verification_submissions")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VerificationSubmission[];
}

/** Short-lived signed link. Evidence is never public. */
export async function getEvidenceUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("verification-evidence")
    .createSignedUrl(path, 120);
  if (error) throw error;
  return data.signedUrl;
}
