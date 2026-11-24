import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { fetchProfile } from "../services/auth";
import type { Profile } from "../types";
import { AuthContext } from "./auth-context";
import type { AuthState } from "./auth-context";

type ProfileState = { userId: string; profile: Profile | null };

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Loads a profile, retrying a couple of times so a brief network or token hiccup is not fatal. */
async function loadProfileWithRetry(userId: string): Promise<Profile | null> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const row = await fetchProfile(userId);
      if (row) return row;
      // The signup trigger may not have committed yet: wait and look again.
    } catch (error) {
      lastError = error;
    }
    await wait(400 * (attempt + 1));
  }
  if (lastError) console.error("GIDALINK PROFILE ERROR:", lastError);
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionChecked(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    loadProfileWithRetry(userId).then((profile) => {
      if (active) setProfileState({ userId, profile });
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    setProfileState(null);
    setProfileState({ userId, profile: await loadProfileWithRetry(userId) });
  }, [userId]);

  const value = useMemo<AuthState>(() => {
    // Loading covers both "have we read the session yet" and "has this user's profile arrived".
    // This closes the gap where a user existed but the profile had not loaded, which used to
    // flash a "could not load your profile" error right after sign-in.
    const profileReady = !userId || profileState?.userId === userId;
    const profile = profileState?.userId === userId ? profileState.profile : null;

    return {
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading: !sessionChecked || !profileReady,
      refreshProfile,
    };
  }, [session, sessionChecked, profileState, userId, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
