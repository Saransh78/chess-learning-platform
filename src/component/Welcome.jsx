import HeroCopy from "./landing/HeroCopy";
import ProductPreview from "./landing/ProductPreview";
import TrustStrip from "./landing/TrustStrip";
import FeatureCards from "./landing/FeatureCards";

function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,239,231,0.022)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,239,231,0.022)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-32 left-1/2 h-96 w-[42rem] max-w-none -translate-x-1/2 rounded-full bg-bronze/[0.08] blur-3xl" />
      <div className="absolute right-[-8rem] top-1/3 h-72 w-72 rounded-full bg-sage/[0.05] blur-3xl" />
    </div>
  );
}

export default function Welcome({ onGetStarted }) {
  return (
    <main className="relative flex-1 overflow-hidden">
      <AmbientBackground />

      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-14 text-center sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:text-left">
        <HeroCopy onGetStarted={onGetStarted} />
        <ProductPreview />
      </section>

      <div className="relative">
        <TrustStrip />
      </div>

      <FeatureCards />

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center">
        <p className="text-xs tracking-wide text-faded">
          BoardSense · Stockfish analyzes every position. BoardSense analyzes
          you.
        </p>
      </footer>
    </main>
  );
}
