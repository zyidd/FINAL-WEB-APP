import React, { useState } from "react";
import { Key, X, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Loader2 } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  hasServerKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  hasServerKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    onClose();
  };

  const handleClear = () => {
    setInputKey("");
    onSaveKey("");
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const keyToTest = inputKey.trim() || apiKey;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToTest }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: "Koneksi Gemini API berhasil! Key Anda aktif & siap digunakan.",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gagal memverifikasi API Key. Periksa kembali key Anda.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Gagal menghubungi server untuk verifikasi.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-[0_0_60px_rgba(0,186,255,0.15)] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gemini API Key Setup</h2>
            <p className="text-[10px] text-slate-400">Disimpan lokal di browser (localStorage)</p>
          </div>
        </div>

        {/* Status server key info */}
        {hasServerKey && (
          <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Server Key Aktif:</span> Kosongkan untuk menggunakan default server AI Studio.
            </div>
          </div>
        )}

        {/* Input */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Google AI Studio API Key
          </label>
          <div className="relative">
            <input
              id="gemini-api-key-input"
              type={showKey ? "text" : "password"}
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800/40 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono tracking-wide pr-10 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Get Free API Key</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            {inputKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-400 hover:underline"
              >
                Hapus Key
              </button>
            )}
          </div>

          {/* Test Status Box */}
          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-[11px] flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/40 border border-rose-500/30 text-rose-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 bg-slate-800/60 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <span>Tes Koneksi</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Simpan Key</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
