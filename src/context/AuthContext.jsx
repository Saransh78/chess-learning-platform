import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../services/supabaseClient";
import { AuthContext } from "./authContextValue";

function toPublicUser(supabaseUser) {
  if (!supabaseUser) return null;
  const metadata = supabaseUser.user_metadata || {};
  const email = supabaseUser.email || metadata.email || "";
  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.preferred_username ||
    metadata.user_name ||
    (email.includes("@") ? email.split("@")[0] : "");
  const avatar =
    metadata.avatar_url || metadata.picture || metadata.avatar || "";
  return {
    id: supabaseUser.id,
    email,
    name,
    avatar,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(
    () => Boolean(isSupabaseConfigured && supabase)
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session || null);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Could not restore the session.");
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setError("");
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      const message =
        "Google sign-in is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
      setError(message);
      return { error: message };
    }
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) setError(oauthError.message);
    return { error: oauthError?.message || "" };
  }, []);

  const signOut = useCallback(async () => {
    setError("");
    if (!supabase) {
      setSession(null);
      return;
    }
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    // Supabase clears its persisted session. Only auth state is reset here;
    // report jobs, board state, and theme are intentionally preserved.
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: toPublicUser(session?.user),
      session,
      loading,
      error,
      isConfigured: isSupabaseConfigured,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, error, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
