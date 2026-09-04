import React from "react";
import { Key } from "lucide-react";

interface HeaderProps {
  hasKey: boolean;
  onOpenKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasKey, onOpenKeyModal }) => {
  return (
    <header className="px-6 pt-4 pb-3 flex justify-between items-center bg-[#020617]/90 backdrop-blur-md border-b border-slate-800/80 shrink-0">
      <div>
        <h1 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
          PRO STUDIO
        </h1>
        <div className="text-white font-black text-xl tracking-tighter">
          AFFILIATOR <span className="text-cyan-400">AI</span>
        </div>
      </div>

      {/* API Key Modal Action Button */}
      <button
        id="open-api-key-btn"
        onClick={onOpenKeyModal}
        className={`w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-colors relative ${
          hasKey ? "border-emerald-500/40 text-emerald-400" : ""
        }`}
        title="Pengaturan Gemini API Key"
      >
        <Key className="w-5 h-5" />
        <span
          className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
            hasKey ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-amber-400"
          }`}
        ></span>
      </button>
    </header>
  );
};

