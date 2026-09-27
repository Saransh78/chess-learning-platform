import { useAuth } from "../../hooks/useAuth";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.24 1.4-1.55 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.59-2.5C16.8 3.6 14.6 2.5 12 2.5 7.1 2.5 3 6.6 3 12s4.1 9.5 9 9.5c5.2 0 8.65-3.65 8.65-8.8 0-.59-.06-1.04-.14-1.5H12z"
      />
    </svg>
  );
}

function initialsFor(name, email) {
  const source = (name || email || "?").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function AuthHeaderControl() {
  const { user, loading, error, isConfigured, signInWithGoogle, signOut } =
    useAuth();

  if (loading) {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-24 animate-pulse rounded-full bg-charcoal ring-1 ring-stone/40"
      />
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={signInWithGoogle}
          title={
            isConfigured
              ? "Continue with Google"
              : "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google sign-in"
          }
          className="inline-flex h-9 items-center gap-2 rounded-full bg-bronze px-4 text-xs font-semibold tracking-wide text-obsidian shadow-[0_10px_24px_-10px_rgba(200,155,90,0.55)] transition-all duration-200 hover:-translate-y-px hover:bg-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze active:translate-y-0"
        >
          <GoogleMark />
          Continue with Google
        </button>
        {error && (
          <p role="alert" className="max-w-56 text-right text-[11px] text-clay">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name ? `${user.name}'s avatar` : "Signed-in user avatar"}
          referrerPolicy="no-referrer"
          className="h-9 w-9 rounded-full object-cover ring-1 ring-bronze/50"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-9 w-9 place-items-center rounded-full bg-bronze/15 text-xs font-semibold text-gold ring-1 ring-bronze/40"
        >
          {initialsFor(user.name, user.email)}
        </span>
      )}
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="max-w-36 truncate text-xs font-semibold text-ivory">
          {user.name || "Chess player"}
        </p>
        {user.email && (
          <p className="max-w-36 truncate text-[11px] text-faded">
            {user.email}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={signOut}
        className="h-9 rounded-full border border-stone/50 px-3.5 text-xs font-medium text-parchment transition-colors duration-200 hover:border-bronze/50 hover:text-ivory"
      >
        Logout
      </button>
    </div>
  );
}
