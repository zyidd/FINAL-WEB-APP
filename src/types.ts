export type FormulaType = "PAS" | "BAB" | "AIDA";

export interface FormulaDefinition {
  id: FormulaType;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  scenesHint: string[];
}

export interface StoryboardScene {
  sceneNumber: number;
  time: string;
  phase: string;
  visual: string;
  narration: string;
}

export interface VideoPrompt {
  sceneNumber: number;
  sceneTitle: string;
  tool: string;
  prompt: string;
}

export interface StoryboardResult {
  productName: string;
  formulaName: string;
  hooks: string[];
  storyboard: StoryboardScene[];
  fullNarration: string;
  wordCount: number;
  videoPrompts: VideoPrompt[];
}

export type VoiceName =
  | "Erinome"
  | "Autonoe"
  | "Callirrhoe"
  | "Despina"
  | "Kore"
  | "Schedar"
  | "Iapetus"
  | "Orus";

export interface VoiceCharacter {
  name: VoiceName;
  gender: "Female" | "Male";
  label: string;
  accentColor: string;
  tone: string;
  avatar: string;
}

export interface AudioState {
  audioUrl: string | null;
  voice: VoiceName;
  speed: string;
  emotion: string;
  duration?: number;
  isGenerating: boolean;
  error?: string | null;
  usingFallback?: boolean;
}
