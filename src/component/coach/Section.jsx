export default function Section({ title, children, delay = 0 }) {
  return (
    <section
      className="rounded-xl bg-slate-ash/40 p-4 animate-fade-in"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-faded">
        {title}
      </h4>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}
