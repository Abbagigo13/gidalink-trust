import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

export type SignUpRole = "buyer" | "landlord" | "agent";

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: SignUpRole = "buyer",
  phone = ""
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        requested_role: role,
        phone,
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?mode=login`,
  });
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function updateProfile(
  userId: string,
  values: { full_name: string; phone: string }
) {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: values.full_name, phone: values.phone || null })
    .eq("id", userId);
  if (error) throw error;
}
