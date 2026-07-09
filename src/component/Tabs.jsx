import { useState } from "react";

export default function Tabs({
  gamesContent,
  movesContent,
  analysisContent,
  aiContent,
}) {
  const [activeTab, setActiveTab] = useState("moves");

  const tabs = [
    { id: "games", label: "Games" },
    { id: "moves", label: "Moves" },
    { id: "analysis", label: "Analysis" },
    { id: "ai", label: "AI" },
  ];

  function renderContent() {
    switch (activeTab) {
      case "games":
        return gamesContent;

      case "moves":
        return movesContent;

      case "analysis":
        return analysisContent;

      case "ai":
        return aiContent;

      default:
        return null;
    }
  }

  return (
    <div className="bg-zinc-700 rounded-xl p-4 h-full flex flex-col">

      <div className="flex gap-2 mb-4">

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-md text-sm transition
            ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-zinc-600 text-zinc-300 hover:bg-zinc-500"
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

    </div>
  );
}