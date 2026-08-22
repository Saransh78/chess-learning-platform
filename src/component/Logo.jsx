const SIZES = {
  sm: "h-9 w-9 rounded-[10px]",
  md: "h-11 w-11 rounded-xl",
  lg: "h-16 w-16 rounded-2xl",
  xl: "h-20 w-20 rounded-[1.4rem]",
};

const GLYPH = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-9 w-9",
  xl: "h-11 w-11",
};

function KnightGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="km-bronze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8A867" />
          <stop offset="100%" stopColor="#B78643" />
        </linearGradient>
      </defs>
      <path
        fill="url(#km-bronze)"
        d="M7.1 19.2c-.3-1.9.1-3.6 1.1-5.1-.8-.3-1.5-.8-2.1-1.5-.4-.5-.4-1.2.1-1.6l1.5-1.3c.9-.8 1.7-1.8 2.3-2.9l.6-1.2c.2-.4.7-.5 1.1-.3l.9.6 2 .3c2.4.4 4.3 2.2 4.8 4.6l.2.9c.4 2.1.3 4.2-.4 6.2l-.3.8a1.4 1.4 0 0 1-1.3.9H8.3c-.6 0-1.1-.4-1.2-1z"
      />
      <path
        fill="url(#km-bronze)"
        d="M5.9 20.9h12.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2H5.9c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2z"
      />
      <circle cx="12.6" cy="8.6" r=".85" fill="#171614" />
    </svg>
  );
}

export default function Logo({ size = "md" }) {
  return (
    <div
      role="img"
      aria-label="BoardSense emblem"
      className={`grid shrink-0 select-none place-items-center bg-gradient-to-b from-slate-ash to-charcoal ring-1 ring-stone shadow-[inset_0_1px_0_rgba(244,239,231,0.07),0_8px_24px_-10px_rgba(0,0,0,0.7)] ${SIZES[size]}`}
    >
      <KnightGlyph className={`${GLYPH[size]} translate-y-[-1px] drop-shadow-[0_2px_6px_rgba(200,155,90,0.35)]`} />
    </div>
  );
}
