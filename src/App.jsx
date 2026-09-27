import { useCallback, useState } from "react";
import Chessboard from "./component/Chessboard";
import Header from "./component/Header";
import SidePanel from "./component/SidePanel";
import Welcome from "./component/Welcome";
import AnalysisWorkspace from "./component/analysis/AnalysisWorkspace";
import { useGame } from "./context/GameContext";
import { getSavedReportJobId } from "./services/reportJobStorage";

export default function App() {
  const [engineEnabled, setEngineEnabled] = useState(true);
  const [entered, setEntered] = useState(false);
  const [savedReportJobId, setSavedReportJobId] = useState(getSavedReportJobId);
  const [analysisOpen, setAnalysisOpen] = useState(() => Boolean(getSavedReportJobId()));
  const [analysisMinimized, setAnalysisMinimized] = useState(false);
  const { games, moveHistory, setMoveHistory } = useGame();

  const hasGames = games.length > 0;
  const hasSavedReportJob = Boolean(savedReportJobId);
  const showApp = hasGames || entered || hasSavedReportJob;

  const openAnalysis = useCallback(() => {
    setAnalysisOpen(true);
    setAnalysisMinimized(false);
  }, []);
  const clearSavedAnalysis = useCallback(() => {
    setSavedReportJobId(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col xl:h-dvh xl:overflow-hidden">
      <Header
        engineEnabled={engineEnabled}
        setEngineEnabled={setEngineEnabled}
      />

      {!showApp ? (
        <Welcome onGetStarted={() => setEntered(true)} />
      ) : (
        <main className="mx-auto w-full max-w-[1400px] flex-1 animate-fade-in px-4 pb-8 pt-5 sm:px-6 xl:pb-4 xl:pt-3">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-start xl:gap-6">
            <div className="w-full min-w-0 animate-settle xl:flex-1">
              <Chessboard
                moveHistory={moveHistory}
                setMoveHistory={setMoveHistory}
                engineEnabled={engineEnabled}
              />
            </div>
            <div className="w-full max-w-[480px] animate-rise [animation-delay:120ms] md:w-[320px] md:max-w-none md:shrink-0 xl:w-[350px]">
              <SidePanel
                engineEnabled={engineEnabled}
                hasSavedAnalysis={hasSavedReportJob}
                onOpenAnalysis={openAnalysis}
              />
            </div>
          </div>
        </main>
      )}

      <AnalysisWorkspace
        open={analysisOpen}
        minimized={analysisMinimized}
        initialJobId={savedReportJobId}
        onOpenChange={setAnalysisOpen}
        onMinimizedChange={setAnalysisMinimized}
        onJobCreated={setSavedReportJobId}
        onJobCleared={clearSavedAnalysis}
      />
    </div>
  );
}
