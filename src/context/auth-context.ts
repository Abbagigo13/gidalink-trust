import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { AccountRole, Profile } from "../types";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AccountRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
