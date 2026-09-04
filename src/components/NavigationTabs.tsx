import React from "react";
import { Film, Mic2 } from "lucide-react";

export type TabId = "storyboard" | "voiceover";

interface NavigationTabsProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  hasScriptTransferred?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  hasScriptTransferred,
}) => {
  return (
    <nav className="px-6 my-3 shrink-0">
      <div className="flex p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
        <button
          id="tab-storyboard-btn"
          onClick={() => onChangeTab("storyboard")}
          className={`flex-1 py-2.5 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "storyboard"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>AI STORYBOARD</span>
        </button>

        <button
          id="tab-voiceover-btn"
          onClick={() => onChangeTab("voiceover")}
          className={`flex-1 py-2.5 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === "voiceover"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Mic2 className="w-3.5 h-3.5" />
          <span>VOICE OVER</span>
          {hasScriptTransferred && activeTab !== "voiceover" && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

