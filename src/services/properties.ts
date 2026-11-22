import { supabase } from "../lib/supabase";

export async function getProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .in("status", ["pending_review", "verified"])
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
