import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Video,
  Layers,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { FormulaType, StoryboardResult } from "../types";
import { PRODUCT_SUGGESTIONS, FORMULA_DEFINITIONS } from "../constants";

interface StoryboardTabProps {
  product: string;
  setProduct: (val: string) => void;
  selectedFormula: FormulaType;
  setSelectedFormula: (val: FormulaType) => void;
  storyboardResult: StoryboardResult | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  onTransferToVoiceOver: (script: string) => void;
}

export const StoryboardTab: React.FC<StoryboardTabProps> = ({
  product,
  setProduct,
  selectedFormula,
  setSelectedFormula,
  storyboardResult,
  onGenerate,
  isGenerating,
  onTransferToVoiceOver,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="px-6 space-y-6 pb-8">
      {/* 1. PRODUCT & PRODUCT SUGGESTIONS */}
      <section>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
          Product & Product Suggestions
        </label>
        <div className="relative">
          <input
            id="product-input"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Enter product name..."
            className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {product && (
            <button
              onClick={() => setProduct("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {PRODUCT_SUGGESTIONS.map((item) => (
            <button
              key={item}
              id={`suggestion-${item.toLowerCase().replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => setProduct(item)}
              className={`px-3 py-1 rounded-lg text-[10px] border cursor-pointer transition-colors ${
                product === item
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60"
                  : "bg-slate-800/60 text-cyan-300 border-slate-700/50 hover:bg-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* 2. STRATEGY FORMULA */}
      <section>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
          Strategy Formula
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FORMULA_DEFINITIONS.map((formula) => {
            const isSelected = selectedFormula === formula.id;
            return (
              <button
                key={formula.id}
                id={`formula-btn-${formula.id.toLowerCase()}`}
                type="button"
                onClick={() => setSelectedFormula(formula.id)}
                className={`p-2.5 rounded-xl text-center transition-all ${
                  isSelected
                    ? "bg-cyan-500/10 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-slate-800/40 border border-slate-700 hover:border-cyan-500"
                }`}
              >
                <div className={`text-xs font-bold ${isSelected ? "text-cyan-400" : "text-white"}`}>
                  {formula.id}
                </div>
                <div
                  className={`text-[8px] uppercase tracking-wider mt-0.5 truncate ${
                    isSelected ? "text-cyan-400" : "text-slate-500"
                  }`}
                >
                  {formula.id === "PAS" ? "Problem" : formula.id === "BAB" ? "Before After" : "Attention"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. GENERATE BUTTON */}
      <button
        id="generate-storyboard-btn"
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !product.trim()}
        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all ${
          isGenerating || !product.trim()
            ? "bg-slate-800/60 text-slate-500 border border-slate-700 cursor-not-allowed"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-[0.99]"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            <span>GENERATING ENGINE...</span>
          </>
        ) : (
          <>
            <span>GENERATE ENGINE</span>
            <Sparkles className="w-4 h-4 text-slate-950" />
          </>
        )}
      </button>

      {/* 4. AI RESULTS PRESENTATION (FROSTED GLASS) */}
      {storyboardResult && (
        <div className="space-y-4 pt-2 animate-fadeIn">
          {/* A. 3 WINNING HOOKS */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  3 Winning Hooks
                </span>
              </div>
              <span className="text-[9px] text-cyan-400 font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                0-3s Stop-Scroll
              </span>
            </div>

            <div className="space-y-2">
              {storyboardResult.hooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-800/30 rounded-lg border-l-2 border-cyan-500 text-[11px] text-slate-300 flex items-start justify-between gap-2.5 transition-colors hover:bg-slate-800/50"
                >
                  <p className="leading-relaxed flex-1">"{hook}"</p>
                  <button
                    onClick={() => handleCopyText(hook, `hook-${idx}`)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors shrink-0"
                    title="Salin Hook"
                  >
                    {copiedIndex === `hook-${idx}` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* B. 20s STORYBOARD TABLE */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  20s Storyboard
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                ~{storyboardResult.wordCount || 48} words
              </span>
            </div>

            {/* Storyboard Table */}
            <div className="text-[10px] border border-slate-800 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-slate-800/50 p-2 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <div className="col-span-1">Time</div>
                <div className="col-span-3">Action & Narration</div>
              </div>

              {storyboardResult.storyboard.map((scene, idx) => (
                <div
                  key={scene.sceneNumber}
                  className={`grid grid-cols-4 p-2.5 text-slate-300 ${
                    idx !== storyboardResult.storyboard.length - 1
                      ? "border-b border-slate-800/50"
                      : ""
                  } ${idx % 2 === 0 ? "bg-slate-800/20" : "bg-transparent"} hover:bg-slate-800/40 transition-colors`}
                >
                  <div className="col-span-1 font-mono text-cyan-400 font-bold">
                    {scene.time}
                    <div className="text-[9px] text-slate-400 font-sans mt-0.5">{scene.phase}</div>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <div className="text-slate-300 leading-snug">
                      <span className="text-cyan-300 font-medium">POV: </span>
                      {scene.visual}
                    </div>
                    <div className="italic text-slate-200 bg-slate-900/60 p-1.5 rounded border border-slate-800/60 flex items-start justify-between gap-1 mt-1">
                      <span className="leading-snug">"{scene.narration}"</span>
                      <button
                        onClick={() =>
                          handleCopyText(scene.narration, `narration-${scene.sceneNumber}`)
                        }
                        className="text-slate-400 hover:text-cyan-300 shrink-0 ml-1"
                        title="Salin Narasi"
                      >
                        {copiedIndex === `narration-${scene.sceneNumber}` ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Transfer to Voiceover Action */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                id="transfer-to-voiceover-btn"
                type="button"
                onClick={() => onTransferToVoiceOver(storyboardResult.fullNarration)}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Transfer Narasi ke Voice Over</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* C. 4 AI VIDEO PROMPTS */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  4 AI Video Prompts (Kling / Runway)
                </span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                9:16 Vertical
              </span>
            </div>

            <div className="space-y-2.5">
              {storyboardResult.videoPrompts.map((vp, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/30 border border-slate-800 rounded-xl p-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300">{vp.sceneTitle}</span>
                    <button
                      onClick={() => handleCopyText(vp.prompt, `vp-${idx}`)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      {copiedIndex === `vp-${idx}` ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/80 leading-relaxed select-all">
                    {vp.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

