import React, { useState, useRef, useEffect } from "react";
import {
  Mic2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Loader2,
  Gauge,
  Smile,
  FileText,
  AlertCircle,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { VoiceName, AudioState } from "../types";
import { VOICE_CHARACTERS, SPEED_OPTIONS, EMOTION_SUGGESTIONS } from "../constants";

interface VoiceOverTabProps {
  script: string;
  setScript: (val: string) => void;
  selectedVoice: VoiceName;
  setSelectedVoice: (voice: VoiceName) => void;
  speed: string;
  setSpeed: (spd: string) => void;
  emotion: string;
  setEmotion: (emo: string) => void;
  audioState: AudioState;
  onGenerateAudio: () => Promise<void>;
}

export const VoiceOverTab: React.FC<VoiceOverTabProps> = ({
  script,
  setScript,
  selectedVoice,
  setSelectedVoice,
  speed,
  setSpeed,
  emotion,
  setEmotion,
  audioState,
  onGenerateAudio,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [browserSpeaking, setBrowserSpeaking] = useState(false);

  const wordCount = script.trim() ? script.trim().split(/\s+/).filter(Boolean).length : 0;
  // Average speaking pace ~140-150 words per minute (2.4 words per second)
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 2.4)));

  // Handle HTML5 Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioState.audioUrl]);

  const togglePlayPause = () => {
    if (audioState.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    } else {
      // Fallback browser speech synthesis
      playBrowserSpeech();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Browser Speech synthesis fallback if desired or for quick test
  const playBrowserSpeech = () => {
    if (!("speechSynthesis" in window)) return;
    if (browserSpeaking) {
      window.speechSynthesis.cancel();
      setBrowserSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = "id-ID";
    const rateVal = parseFloat(speed.replace("x", "")) || 1.0;
    utterance.rate = rateVal;

    utterance.onstart = () => setBrowserSpeaking(true);
    utterance.onend = () => setBrowserSpeaking(false);
    utterance.onerror = () => setBrowserSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const selectedVoiceObj =
    VOICE_CHARACTERS.find((v) => v.name === selectedVoice) || VOICE_CHARACTERS[0];

  return (
    <div className="px-6 space-y-6 pb-8">
      {/* 1. SCRIPT INPUT AREA */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Voice Over Script
          </label>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-lg border ${
                wordCount >= 40 && wordCount <= 55
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                  : "bg-slate-800/60 text-slate-300 border-slate-700"
              }`}
            >
              {wordCount} words
            </span>
            <span className="text-slate-400 font-mono">(~{estimatedSeconds}s)</span>
          </div>
        </div>

        <textarea
          id="narration-script-textarea"
          rows={4}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter narration script for Gemini Flash TTS (or transfer from Tab 1)..."
          className="w-full bg-slate-800/40 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 leading-relaxed outline-none focus:border-cyan-500 transition-colors resize-none"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Ideal target: 45-50 words for 20s TikTok video
          </span>
          {script && (
            <button
              type="button"
              onClick={() => setScript("")}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* 2. VOICE SELECTION (GEMINI PREBUILT VOICES) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Gemini Voice Character
          </label>
          <span className="text-[9px] text-cyan-400 font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
            8 Gemini Characters
          </span>
        </div>

        {/* Dropdown Selection */}
        <div className="relative mb-2.5">
          <select
            id="voice-character-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value as VoiceName)}
            className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer transition-colors"
          >
            {VOICE_CHARACTERS.map((v) => (
              <option key={v.name} value={v.name} className="bg-slate-900 text-white py-1">
                {v.avatar} {v.label} ({v.gender})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* Active Voice Info Card (Frosted Glass) */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="text-2xl w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700/60 shrink-0">
            {selectedVoiceObj.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {selectedVoiceObj.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {selectedVoiceObj.gender}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {selectedVoiceObj.tone}
            </p>
          </div>
        </div>
      </section>

      {/* 3. PACING & EMOTION CONTROLS */}
      <section className="space-y-4">
        {/* Speed Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
            Speaking Pacing (Speed)
          </label>
          <div className="relative">
            <select
              id="voice-speed-select"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer transition-colors"
            >
              {SPEED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Emotion / Speech Style Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
            Speech Style & Emotion
          </label>
          <input
            id="voice-emotion-input"
            type="text"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="e.g. Professional & convincing, Excited, Urgent..."
            className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />

          {/* Quick Emotion Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EMOTION_SUGGESTIONS.map((emo) => (
              <button
                key={emo}
                type="button"
                onClick={() => setEmotion(emo)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                  emotion === emo
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                    : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {emo}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GENERATE AUDIO BUTTON */}
      <button
        id="generate-audio-btn"
        type="button"
        onClick={onGenerateAudio}
        disabled={audioState.isGenerating || !script.trim()}
        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all ${
          audioState.isGenerating || !script.trim()
            ? "bg-slate-800/60 text-slate-500 border border-slate-700 cursor-not-allowed"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-[0.99]"
        }`}
      >
        {audioState.isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            <span>GENERATING GEMINI TTS...</span>
          </>
        ) : (
          <>
            <span>GENERATE AUDIO (GEMINI FLASH TTS)</span>
            <Sparkles className="w-4 h-4 text-slate-950" />
          </>
        )}
      </button>

      {/* Error Message if any */}
      {audioState.error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Gagal Memproses Suara Gemini TTS:</p>
            <p className="text-[11px] text-rose-200/90 mt-0.5">{audioState.error}</p>
            <button
              type="button"
              onClick={playBrowserSpeech}
              className="mt-2 text-xs font-semibold underline text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Gunakan Suara Browser Lokal (Pratinjau Alternatif)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. AUDIO PLAYER PREVIEW (FROSTED GLASS) */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Audio Player Preview
            </span>
          </div>

          {audioState.audioUrl && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Ready</span>
            </span>
          )}
        </div>

        {/* Hidden HTML5 Audio Element */}
        {audioState.audioUrl && (
          <audio ref={audioRef} src={audioState.audioUrl} preload="auto" />
        )}

        {/* Interactive Waveform / Progress bar */}
        <div className="space-y-1.5">
          {/* Animated visualizer bars */}
          <div className="h-8 bg-slate-950/80 rounded-xl px-3 flex items-center justify-center gap-1 border border-slate-800/80">
            {Array.from({ length: 24 }).map((_, i) => {
              const isBarActive = isPlaying || browserSpeaking;
              const heightPercentage = isBarActive
                ? `${Math.max(20, Math.sin(i * 0.5 + currentTime * 5) * 50 + 50)}%`
                : "25%";
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isBarActive ? "bg-cyan-400" : "bg-slate-700"
                  }`}
                  style={{ height: heightPercentage }}
                />
              );
            })}
          </div>

          {/* Range Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 w-8">
              {formatTime(currentTime)}
            </span>
            <input
              id="audio-seek-slider"
              type="range"
              min={0}
              max={duration || 20}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={!audioState.audioUrl}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:cursor-not-allowed"
            />
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
              {formatTime(duration || estimatedSeconds)}
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              id="audio-play-pause-btn"
              type="button"
              onClick={togglePlayPause}
              disabled={!audioState.audioUrl && !script.trim()}
              className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-95 transition-all disabled:opacity-50"
              title={isPlaying ? "Jeda" : "Putar Audio"}
            >
              {isPlaying || browserSpeaking ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              disabled={!audioState.audioUrl}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Quick Browser TTS Preview Button */}
            <button
              type="button"
              onClick={playBrowserSpeech}
              disabled={!script.trim()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[10px] font-medium border border-slate-700/60 transition-colors flex items-center gap-1 disabled:opacity-40"
              title="Putar dengan suara browser lokal"
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Preview Browser</span>
            </button>
          </div>

          {/* Download Audio File */}
          {audioState.audioUrl ? (
            <a
              id="download-audio-btn"
              href={audioState.audioUrl}
              download={`affiliator-${selectedVoice.toLowerCase()}-20s.wav`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.WAV</span>
            </a>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/40 text-slate-600 text-xs font-bold cursor-not-allowed border border-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.WAV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
