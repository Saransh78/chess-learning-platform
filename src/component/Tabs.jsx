import { useState } from "react";

export default function Tabs({
  gamesContent,
  movesContent,
  engineContent,
  coachContent,
}) {
  const [activeTab, setActiveTab] = useState("moves");

  const tabs = [
    { id: "games", label: "Games" },
    { id: "moves", label: "Moves" },
    { id: "engine", label: "Engine" },
    { id: "coach", label: "AI Coach" },
  ];
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  function renderContent() {
    switch (activeTab) {
      case "games":
        return gamesContent;
      case "moves":
        return movesContent;
      case "engine":
        return engineContent;
      case "coach":
        return coachContent;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Panel sections"
        className="relative flex shrink-0 rounded-xl bg-obsidian/70 p-1 ring-1 ring-stone/30"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-lg bg-slate-ash shadow-[0_2px_10px_-2px_rgba(0,0,0,0.45)] ring-1 ring-stone/40 transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${tabs.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 min-w-0 flex-1 rounded-lg px-2 pb-2 pt-[7px] text-xs font-medium transition-colors duration-200 ${
                active ? "text-ivory" : "text-faded hover:text-parchment"
              }`}
            >
              <span className="block truncate">{tab.label}</span>
              <span
                aria-hidden="true"
                className={`absolute bottom-[3px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-sage transition-opacity duration-200 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="scrollbar-thin mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5 animate-fade-in" key={activeTab}>
        {renderContent()}
      </div>
    </div>
  );
}
