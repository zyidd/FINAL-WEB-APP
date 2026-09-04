import { FormulaDefinition, VoiceCharacter } from "./types";

export const PRODUCT_SUGGESTIONS = [
  "100 Ide Cuan AI",
  "Serum Retinol",
  "Smartwatch",
  "Mic Clip-on Wireless",
  "Ring Light Mini Portable",
  "Thermos Vacuum Viral",
];

export const FORMULA_DEFINITIONS: FormulaDefinition[] = [
  {
    id: "PAS",
    name: "Angle 1 (Formula PAS)",
    badge: "Problem • Agitate • Solution",
    tagline: "Sentuh rasa sakit audiens lalu berikan solusi instan",
    description: "Sangat efektif untuk produk yang menyelesaikan keresahan nyata secara cepat.",
    scenesHint: ["00-03s: Hook Masalah", "04-09s: Perparah Rasa Frustrasi", "10-15s: Solusi Produk", "16-20s: CTA Keranjang"],
  },
  {
    id: "BAB",
    name: "Angle 2 (Formula BAB)",
    badge: "Before • After • Bridge",
    tagline: "Perlihatkan transformasi nyata dari kondisi lama ke kondisi baru",
    description: "Formula visual terbaik untuk skincare, gadget, tools produktivitas, dan fashion.",
    scenesHint: ["00-03s: Hook Before", "04-09s: Kondisi Lama vs Baru", "10-15s: Keajaiban Hasil (After)", "16-20s: Bridge ke Link Pembelian"],
  },
  {
    id: "AIDA",
    name: "Angle 3 (Formula AIDA)",
    badge: "Attention • Interest • Desire • Action",
    tagline: "Alur copywriting klasik dengan rasio konversi teruji",
    description: "Format terstruktur dari mencuri perhatian hingga memicu aksi beli spontan.",
    scenesHint: ["00-03s: Attention Magnet", "04-09s: Interest Trigger", "10-15s: Desire / Social Proof", "16-20s: Urgensi Call To Action"],
  },
];

export const VOICE_CHARACTERS: VoiceCharacter[] = [
  {
    name: "Kore",
    gender: "Female",
    label: "Kore (Natural & Authentic)",
    accentColor: "from-cyan-500 to-blue-600",
    tone: "Natural, ramah, seperti rekomendasi tulus dari teman",
    avatar: "👩‍🦰",
  },
  {
    name: "Erinome",
    gender: "Female",
    label: "Erinome (Energetic & Modern)",
    accentColor: "from-pink-500 to-rose-600",
    tone: "Ceria, enerjik, gaya konten Gen Z & TikTok trending",
    avatar: "👧",
  },
  {
    name: "Autonoe",
    gender: "Female",
    label: "Autonoe (Warm & Trustworthy)",
    accentColor: "from-amber-500 to-orange-600",
    tone: "Hangat, tenang, sangat cocok untuk skincare & lifestyle",
    avatar: "👩",
  },
  {
    name: "Callirrhoe",
    gender: "Female",
    label: "Callirrhoe (Vibrant & Expressive)",
    accentColor: "from-purple-500 to-indigo-600",
    tone: "Ekspresif, antusias, cocok untuk unboxing seru & heboh",
    avatar: "👱‍♀️",
  },
  {
    name: "Despina",
    gender: "Female",
    label: "Despina (Smooth & Elegant)",
    accentColor: "from-emerald-500 to-teal-600",
    tone: "Lembut, mewah, meyakinkan untuk produk premium",
    avatar: "👸",
  },
  {
    name: "Schedar",
    gender: "Male",
    label: "Schedar (Deep & Authoritative)",
    accentColor: "from-blue-600 to-indigo-700",
    tone: "Suara berat, berwibawa, sangat pas untuk gadget & AI tools",
    avatar: "🧔",
  },
  {
    name: "Iapetus",
    gender: "Male",
    label: "Iapetus (Casual & Relatable)",
    accentColor: "from-teal-500 to-cyan-600",
    tone: "Santai, gaul, gaya obrolan santai keseharian",
    avatar: "👨",
  },
  {
    name: "Orus",
    gender: "Male",
    label: "Orus (Persuasive & Dynamic)",
    accentColor: "from-orange-500 to-red-600",
    tone: "Tegas, persuasif, membakar semangat beli audiens",
    avatar: "🧑‍💼",
  },
];

export const SPEED_OPTIONS = [
  { value: "0.85x", label: "0.85x (Slow & Emphatic)" },
  { value: "1.0x", label: "1.0x (Normal Pace)" },
  { value: "1.1x", label: "1.1x (TikTok High Retention)" },
  { value: "1.25x", label: "1.25x (Fast & Energetic)" },
];

export const EMOTION_SUGGESTIONS = [
  "Professional and convincing",
  "Excited & enthusiastic",
  "Casual TikTok slang & friendly",
  "Shocked & curious storytelling",
  "Urgent promo with FOMO",
];

// Sample initial data so creators have immediate rich visuals
export const SAMPLE_INITIAL_STORYBOARD = {
  productName: "100 Ide Cuan AI",
  formulaName: "Angle 1 (Formula PAS)",
  hooks: [
    "Masih bingung mau mulai bisnis apa di 2026? Stop scrolling, dengerin ini!",
    "Capek kerja 9-to-5 tapi gaji numpang lewat? Modalnya cuma AI gratisan ini!",
    "Bongkar rahasia cuan jutaan per hari cuma modal laptop dan prompt AI!",
  ],
  storyboard: [
    {
      sceneNumber: 1,
      time: "00-03s",
      phase: "Hook / Attention",
      visual: "Close-up kreator menatap tajam ke kamera sambil menunjuk layar laptop yang menampilkan saldo rekening bertambah. Teks besar neon: 'STOP SCROLLING!'.",
      narration: "Masih pusing cari tambahan cuan tanpa modal gede?",
    },
    {
      sceneNumber: 2,
      time: "04-09s",
      phase: "Problem & Agitate",
      visual: "B-roll cepat wajah frustrasi melihat tumpukan tagihan, beralih ke rekaman mengetik prompt AI dengan animasi grafik melonjak.",
      narration: "Banyak yang terjebak kerja lembur tapi saldo tetap segitu aja, padahal AI udah bisa otomatisasi semuanya!",
    },
    {
      sceneNumber: 3,
      time: "10-15s",
      phase: "Solution & Benefit",
      visual: "Layar split screen memperlihatkan e-book '100 Ide Cuan AI' dibuka dengan visual infografis modern dan template siap pakai.",
      narration: "Untung nemu blueprint '100 Ide Cuan AI', isinya panduan langkah demi langkah dari nol sampai hasil nyata.",
    },
    {
      sceneNumber: 4,
      time: "16-20s",
      phase: "Call To Action",
      visual: "Kreator tersenyum memegang smartphone, jari menunjuk ke arah pojok kiri bawah (keranjang kuning). Animasi panah berkedip.",
      narration: "Mumpung lagi promo diskon 70%, langsung amankan di keranjang kuning sekarang sebelum kehabisan!",
    },
  ],
  fullNarration:
    "Masih pusing cari tambahan cuan tanpa modal gede? Banyak yang terjebak kerja lembur tapi saldo tetap segitu aja, padahal AI udah bisa otomatisasi semuanya! Untung nemu blueprint 100 Ide Cuan AI, isinya panduan langkah demi langkah dari nol sampai hasil nyata. Mumpung lagi promo diskon 70%, langsung amankan di keranjang kuning sekarang sebelum kehabisan!",
  wordCount: 50,
  videoPrompts: [
    {
      sceneNumber: 1,
      sceneTitle: "Scene 1 (00-03s) Hook",
      tool: "Kling AI / Runway Gen-3",
      prompt: "Cinematic vertical 9:16 shot, dramatic moody studio lighting with neon cyan rim light. A young Southeast Asian creator in modern dark hoodie looking directly into the camera with an intense shocking expression, pointing towards glowing laptop screen, 8k resolution, photorealistic, subtle camera zoom in.",
    },
    {
      sceneNumber: 2,
      sceneTitle: "Scene 2 (04-09s) Frustration & Shift",
      tool: "Kling AI / Runway Gen-3",
      prompt: "Hyper-realistic vertical 9:16 medium shot, fast motion blur transition. Dimly lit modern home office, hands typing fast on sleek mechanical keyboard with glowing blue RGB backlight, glowing holographic financial charts rising into the air, cinematic depth of field.",
    },
    {
      sceneNumber: 3,
      sceneTitle: "Scene 3 (10-15s) AI Blueprint Showcase",
      tool: "Kling AI / Runway Gen-3",
      prompt: "Ultra-sharp 9:16 macro commercial shot of an elegant tablet screen displaying glowing 3D digital book titled '100 IDE CUAN AI' with floating golden particle effects, clean minimalist aesthetic, smooth camera tilt up, 4k 60fps.",
    },
    {
      sceneNumber: 4,
      sceneTitle: "Scene 4 (16-20s) Call To Action",
      tool: "Kling AI / Runway Gen-3",
      prompt: "Dynamic vertical 9:16 portrait of a smiling confident creator holding a sleek smartphone, gesturing enthusiastically downward towards the bottom left corner where a shopping bag icon glows, bright studio rim lighting, cinematic bokeh background.",
    },
  ],
};
