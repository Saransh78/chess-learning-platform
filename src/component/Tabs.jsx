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
    { id: "coach", label: "Coach Report" },
  ];

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
        className="flex shrink-0 gap-0.5 rounded-xl bg-obsidian/70 p-1 ring-1 ring-stone/30"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 ${
                active
                  ? "bg-slate-ash text-ivory shadow-sm shadow-black/30 ring-1 ring-stone/40"
                  : "text-faded hover:bg-charcoal/60 hover:text-parchment"
              }`}
            >
              <span className="truncate">{tab.label}</span>
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
