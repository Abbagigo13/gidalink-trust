import { supabase } from "../lib/supabase";
import type { PublicPropertyRow } from "../types";

/** Public discovery: reads the `public_properties` view, which never exposes address or owner. */
export async function getPublicProperties(): Promise<PublicPropertyRow[]> {
  const { data, error } = await supabase
    .from("public_properties")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PublicPropertyRow[];
}

export async function getPublicPropertiesByIds(
  ids: string[]
): Promise<PublicPropertyRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("public_properties")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as PublicPropertyRow[];
}

export async function getPublicPropertyById(
  id: string
): Promise<PublicPropertyRow | null> {
  const { data, error } = await supabase
    .from("public_properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as PublicPropertyRow | null) ?? null;
}
