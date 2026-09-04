import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { NavigationTabs, TabId } from "./components/NavigationTabs";
import { StoryboardTab } from "./components/StoryboardTab";
import { VoiceOverTab } from "./components/VoiceOverTab";
import { FormulaType, VoiceName, StoryboardResult, AudioState } from "./types";
import { SAMPLE_INITIAL_STORYBOARD } from "./constants";
import { Sparkles, Check, AlertCircle } from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>("storyboard");

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("gemini_custom_api_key") || "";
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);

  // Tab 1 state: Storyboard & Prompts
  const [product, setProduct] = useState("100 Ide Cuan AI");
  const [selectedFormula, setSelectedFormula] = useState<FormulaType>("PAS");
  const [storyboardResult, setStoryboardResult] = useState<StoryboardResult | null>(
    SAMPLE_INITIAL_STORYBOARD
  );
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);

  // Tab 2 state: Voice Over Studio
  const [script, setScript] = useState<string>(SAMPLE_INITIAL_STORYBOARD.fullNarration);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>("Kore");
  const [speed, setSpeed] = useState("1.0x");
  const [emotion, setEmotion] = useState("Professional and convincing");
  const [audioState, setAudioState] = useState<AudioState>({
    audioUrl: null,
    voice: "Kore",
    speed: "1.0x",
    emotion: "Professional and convincing",
    isGenerating: false,
    error: null,
  });

  const [hasScriptTransferred, setHasScriptTransferred] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check server health on load
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasServerKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => {
        // Dev server or standard mode
      });
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem("gemini_custom_api_key", newKey);
      showToast("API Key tersimpan dengan aman!", "success");
    } else {
      localStorage.removeItem("gemini_custom_api_key");
      showToast("API Key kustom dihapus, menggunakan default server.", "success");
    }
  };

  // Generate Storyboard using Gemini
  const handleGenerateStoryboard = async () => {
    if (!product.trim()) {
      showToast("Silakan masukkan nama produk terlebih dahulu.", "error");
      return;
    }

    setIsGeneratingStoryboard(true);
    try {
      const res = await fetch("/api/generate-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.trim(),
          formula: selectedFormula,
          apiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan storyboard AI.");
      }

      setStoryboardResult(data);
      // Automatically update the voiceover script so user is ready
      setScript(data.fullNarration);
      showToast("Storyboard 20 detik & Prompt AI berhasil dibuat!", "success");
    } catch (err: any) {
      console.error("Storyboard error:", err);
      showToast(err.message || "Gagal menghasilkan storyboard. Silakan cek API key.", "error");
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // Transfer script to Voice Over tab
  const handleTransferToVoiceOver = (narrationText: string) => {
    setScript(narrationText);
    setActiveTab("voiceover");
    setHasScriptTransferred(true);
    showToast("Naskah berhasil ditransfer ke Voice Over Studio!", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate Audio via Gemini Flash TTS
  const handleGenerateAudio = async () => {
    if (!script.trim()) {
      showToast("Naskah narasi tidak boleh kosong.", "error");
      return;
    }

    setAudioState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const res = await fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script.trim(),
          voice: selectedVoice,
          speed,
          emotion,
          apiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan audio dengan Gemini TTS.");
      }

      setAudioState({
        audioUrl: data.audioUrl,
        voice: selectedVoice,
        speed,
        emotion,
        isGenerating: false,
        error: null,
      });

      showToast(`Audio suara ${selectedVoice} berhasil dibuat!`, "success");
    } catch (err: any) {
      console.error("Audio TTS error:", err);
      setAudioState((prev) => ({
        ...prev,
        isGenerating: false,
        error: err.message || "Gagal memproses audio Gemini TTS.",
      }));
      showToast("Gagal memproses suara. Pratinjau suara lokal tetap tersedia.", "error");
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0a0c10] text-slate-100 flex items-center justify-center p-2 sm:p-6 lg:p-8 font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 0% 0%, #001a2c 0%, transparent 50%), radial-gradient(circle at 100% 100%, #002e3b 0%, transparent 50%)",
      }}
    >
      {/* Frosted Glass Phone Frame */}
      <div className="w-full max-w-[420px] h-[96vh] max-h-[890px] min-h-[640px] bg-[#020617] rounded-[36px] sm:rounded-[48px] border-[8px] sm:border-[12px] border-[#1e293b] shadow-[0_0_80px_rgba(0,186,255,0.18)] flex flex-col overflow-hidden relative">
        {/* Top speaker / notch bar */}
        <div className="h-5 sm:h-6 w-full flex justify-center items-end shrink-0 z-20">
          <div className="w-28 sm:w-32 h-4 sm:h-5 bg-[#1e293b] rounded-b-2xl"></div>
        </div>

        {/* Header with Branding & API Key Modal trigger */}
        <Header
          hasKey={Boolean(apiKey || hasServerKey)}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
        />

        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            if (tab === "voiceover") {
              setHasScriptTransferred(false);
            }
          }}
          hasScriptTransferred={hasScriptTransferred}
        />

        {/* Scrollable Tab Contents with custom frosted scrollbar */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "storyboard" ? (
            <StoryboardTab
              product={product}
              setProduct={setProduct}
              selectedFormula={selectedFormula}
              setSelectedFormula={setSelectedFormula}
              storyboardResult={storyboardResult}
              onGenerate={handleGenerateStoryboard}
              isGenerating={isGeneratingStoryboard}
              onTransferToVoiceOver={handleTransferToVoiceOver}
            />
          ) : (
            <VoiceOverTab
              script={script}
              setScript={setScript}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              speed={speed}
              setSpeed={setSpeed}
              emotion={emotion}
              setEmotion={setEmotion}
              audioState={audioState}
              onGenerateAudio={handleGenerateAudio}
            />
          )}
        </main>

        {/* Toast Floating Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 border transition-all animate-bounce max-w-[90vw] text-center">
            {toastMessage.type === "success" ? (
              <div className="bg-emerald-950/90 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5 px-3 py-1.5 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage.text}</span>
              </div>
            ) : (
              <div className="bg-rose-950/90 text-rose-200 border-rose-500/40 flex items-center gap-1.5 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{toastMessage.text}</span>
              </div>
            )}
          </div>
        )}

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={isKeyModalOpen}
          onClose={() => setIsKeyModalOpen(false)}
          apiKey={apiKey}
          onSaveKey={handleSaveApiKey}
          hasServerKey={hasServerKey}
        />
      </div>
    </div>
  );
}
