import Logo from "./Logo";

export default function Header({ engineEnabled, setEngineEnabled }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone/30 bg-obsidian/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight text-ivory">
              Knight<span className="text-bronze">Mind</span>
            </span>
            <span className="hidden text-xs tracking-wide text-faded md:block">
              Personalized Chess Intelligence
            </span>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={engineEnabled}
          onClick={() => setEngineEnabled((on) => !on)}
          className={`flex items-center gap-2.5 rounded-full border px-3 py-1.5 transition-colors duration-200 ${
            engineEnabled
              ? "border-bronze/40 bg-bronze/10 hover:border-bronze/60"
              : "border-stone/50 bg-charcoal/70 hover:border-stone"
          }`}
        >
          <span
            className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ${
              engineEnabled ? "bg-bronze" : "bg-stone/70"
            }`}
          >
            <span
              className={`absolute h-3 w-3 rounded-full bg-ivory shadow-sm transition-transform duration-200 ${
                engineEnabled ? "translate-x-[14px]" : "translate-x-[2px]"
              }`}
            />
          </span>
          <span
            className={`text-xs font-medium tracking-wide ${
              engineEnabled ? "text-gold" : "text-faded"
            }`}
          >
            Stockfish {engineEnabled ? "On" : "Off"}
          </span>
        </button>
      </nav>
    </header>
  );
}
