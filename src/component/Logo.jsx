const SIZES = {
  sm: "h-9 w-9 rounded-[10px] text-xl",
  md: "h-11 w-11 rounded-xl text-2xl",
  lg: "h-16 w-16 rounded-2xl text-4xl",
  xl: "h-20 w-20 rounded-[1.4rem] text-5xl",
};

export default function Logo({ size = "md" }) {
  return (
    <div
      aria-label="KnightMind"
      className={`grid shrink-0 select-none place-items-center bg-gradient-to-b from-slate-ash to-charcoal ring-1 ring-stone shadow-[inset_0_1px_0_rgba(244,239,231,0.07),0_8px_24px_-10px_rgba(0,0,0,0.7)] ${SIZES[size]}`}
    >
      <span
        className="translate-y-[-1px] leading-none text-bronze drop-shadow-[0_2px_8px_rgba(200,155,90,0.35)]"
      >
        &#9822;
      </span>
    </div>
  );
}
