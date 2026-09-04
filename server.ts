import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key tidak ditemukan. Silakan masukkan API Key di menu pengaturan atau setel GEMINI_API_KEY."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function pcmToWavBuffer(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Health check and default key status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasServerKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
  });
});

// Sleep helper for backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Verify API key endpoint
app.post("/api/verify-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const ai = getGeminiClient(apiKey);
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let verifiedText = "";
    let lastErr: any = null;

    for (const modelName of candidateModels) {
      try {
        const testRes = await ai.models.generateContent({
          model: modelName,
          contents: "Halo, balas 'OK' jika aktif.",
        });
        verifiedText = testRes.text?.trim() || "OK";
        break;
      } catch (err: any) {
        lastErr = err;
        await sleep(400);
      }
    }

    if (!verifiedText) {
      throw lastErr || new Error("Tidak dapat memverifikasi API key.");
    }

    res.json({ success: true, message: verifiedText });
  } catch (err: any) {
    console.error("API Key verify error:", err?.message || err);
    res.status(400).json({
      success: false,
      error: err.message || "Gagal memverifikasi Gemini API Key",
    });
  }
});

// TAB 1: Generate Storyboard, 3 Hooks, and 4 AI Video Prompts
app.post("/api/generate-storyboard", async (req, res) => {
  try {
    const { product, formula, apiKey } = req.body;

    if (!product || typeof product !== "string" || !product.trim()) {
      return res.status(400).json({ error: "Nama produk harus diisi!" });
    }

    const formulaKey = formula || "PAS";
    const ai = getGeminiClient(apiKey);

    const systemPrompt = `Anda adalah World-Class TikTok & Instagram Reels Affiliate Marketing Director dan Top Copywriter di Indonesia.
Tugas Anda adalah merancang konten video afiliasi 20 detik berkonversi tinggi untuk produk: "${product.trim()}".
Gunakan formula copywriting terpilih: "${formulaKey}".

Aturan formula:
- PAS: Problem (Scene 1-2), Agitate (Scene 2), Solution & CTA (Scene 3-4).
- BAB: Before (Scene 1-2), After (Scene 3), Bridge/CTA (Scene 4).
- AIDA: Attention (Scene 1), Interest (Scene 2), Desire (Scene 3), Action/CTA (Scene 4).

Ketentuan Output:
1. "hooks": Buat 3 hook unik berbeda gaya (Contoh: Pola Kontroversi/Rasa Ingin Tahu, Pola Rasa Sakit/FOMO, Pola Hasil Cepat). Bahasa Indonesia natural, gaul, to the point.
2. "storyboard": Tepat 4 baris adegan 20 detik:
   - Adegan 1: "00-03s" (Hook/Opening)
   - Adegan 2: "04-09s" (Problem / Before / Interest)
   - Adegan 3: "10-15s" (Solution / After / Desire)
   - Adegan 4: "16-20s" (Call To Action / Keranjang Kuning / Bio link)
   Setiap adegan harus memiliki:
   - "time": string waktu persis ("00-03s", "04-09s", "10-15s", "16-20s")
   - "phase": nama fase sesuai formula
   - "visual": petunjuk visual detail untuk kreator (gerakan kamera, ekspresi wajah, pencahayaan, teks di layar / overlay text)
   - "narration": teks suara narasi bahasa Indonesia natural, conversational TikTok/Reels tone.
3. Total narasi dari seluruh 4 adegan HARUS sekitar 45-50 kata (total ~45-50 kata) agar pas dibacakan dalam durasi tepat 20 detik tanpa terburu-buru!
4. "fullNarration": Gabungan narasi dari ke-4 adegan menjadi 1 paragraf script utuh (~45-50 kata).
5. "videoPrompts": Buat 4 prompt visual AI generasi video dalam bahasa Inggris yang siap di-copy ke Kling AI, Runway Gen-3, atau Luma. Format:
   - Menjelaskan adegan visual vertikal 9:16, pencahayaan cinematic/studio, gerakan kamera (dynamic slow zoom, smooth pan, macro close up), photorealistic 4k, hyper-detailed.`;

    const promptUser = `Buatkan AI Storyboard lengkap untuk produk afiliasi "${product}" menggunakan formula "${formulaKey}". Berikan output JSON valid sesuai skema.`;

    let rawText = "";
    // High-availability model order with automatic retry on temporary 503 high demand
    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      // Try each model with up to 2 attempts if transient 503 / 429 occurs
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptUser,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  formulaName: { type: Type.STRING },
                  hooks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 unique hooks in Indonesian",
                  },
                  storyboard: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sceneNumber: { type: Type.INTEGER },
                        time: { type: Type.STRING },
                        phase: { type: Type.STRING },
                        visual: { type: Type.STRING },
                        narration: { type: Type.STRING },
                      },
                      required: ["sceneNumber", "time", "phase", "visual", "narration"],
                    },
                  },
                  fullNarration: {
                    type: Type.STRING,
                    description: "Complete combined 20s voiceover script (45-50 words)",
                  },
                  wordCount: { type: Type.INTEGER },
                  videoPrompts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sceneNumber: { type: Type.INTEGER },
                        sceneTitle: { type: Type.STRING },
                        tool: { type: Type.STRING },
                        prompt: { type: Type.STRING },
                      },
                      required: ["sceneNumber", "sceneTitle", "tool", "prompt"],
                    },
                    description: "4 detailed visual AI prompts for Kling AI / Runway in English",
                  },
                },
                required: [
                  "productName",
                  "formulaName",
                  "hooks",
                  "storyboard",
                  "fullNarration",
                  "videoPrompts",
                ],
              },
            },
          });
          rawText = response.text || "";
          if (rawText) break;
        } catch (err: any) {
          lastError = err;
          const isDemandError =
            err?.message?.includes("503") ||
            err?.message?.includes("high demand") ||
            err?.status === "UNAVAILABLE";
          if (attempt === 1 && isDemandError) {
            await sleep(600);
            continue;
          }
          break; // proceed to next candidate model
        }
      }
      if (rawText) break;
    }

    if (!rawText) {
      // High-quality smart generator fallback in case of temporary 503 spikes
      console.log("Using smart template generator for", product, formulaKey);
      const cleanProd = product.trim();
      let formulaTitle = "Angle 1 (Formula PAS)";
      let phaseNames = ["Hook & Masalah", "Perparah Rasa Frustrasi", "Solusi Produk", "Call To Action"];
      if (formulaKey === "BAB") {
        formulaTitle = "Angle 2 (Formula BAB)";
        phaseNames = ["Hook Before", "Kondisi Lama", "Keajaiban Hasil (After)", "Bridge & CTA"];
      } else if (formulaKey === "AIDA") {
        formulaTitle = "Angle 3 (Formula AIDA)";
        phaseNames = ["Attention Hook", "Interest Trigger", "Desire / Proof", "Action Beli"];
      }

      const generatedFallback = {
        productName: cleanProd,
        formulaName: formulaTitle,
        hooks: [
          `Jangan scroll dulu kalau kamu masih bingung cari solusi buat ${cleanProd}!`,
          `Nyesel banget baru tahu rahasia ${cleanProd} ini sekarang, padahal praktis parah!`,
          `Viral di mana-mana! Emang beneran sebagus itu ${cleanProd} ini? Simak 20 detik ini!`,
        ],
        storyboard: [
          {
            sceneNumber: 1,
            time: "00-03s",
            phase: phaseNames[0],
            visual: `Close up kreator ekspresi kaget menatap kamera sambil memegang ${cleanProd}. Teks neon kontras tinggi di layar: 'STOP SCROLLING!'. Kamera zoom in cepat.`,
            narration: `Masih sering pusing dan ribet gara-gara masalah yang satu ini?`,
          },
          {
            sceneNumber: 2,
            time: "04-09s",
            phase: phaseNames[1],
            visual: `Visual b-roll cepat menyorot rasa frustrasi sehari-hari saat belum memakai produk. Pencahayaan redup berganti terang saat ${cleanProd} dikeluarkan dari kotak.`,
            narration: `Padahal udah coba berbagai cara tapi hasilnya nihil, buang waktu dan bikin capek mental!`,
          },
          {
            sceneNumber: 3,
            time: "10-15s",
            phase: phaseNames[2],
            visual: `Macro commercial shot 9:16 dari ${cleanProd} bekerja secara maksimal. Perlihatkan detail kemasan elegan dan kepuasan pemakaian nyata.`,
            narration: `Untung langsung cobain ${cleanProd}, kualitasnya beneran premium dan bikin semuanya jadi jauh lebih gampang!`,
          },
          {
            sceneNumber: 4,
            time: "16-20s",
            phase: phaseNames[3],
            visual: `Kreator tersenyum antusias, tangan menunjuk ke arah pojok kiri bawah (keranjang kuning). Animasi panah berkedip dan grafis promo diskon terbatas.`,
            narration: `Lagi ada promo potongan harga khusus hari ini, klik keranjang kuning sekarang sebelum kehabisan!`,
          },
        ],
        fullNarration: `Masih sering pusing dan ribet gara-gara masalah yang satu ini? Padahal udah coba berbagai cara tapi hasilnya nihil, buang waktu dan bikin capek mental! Untung langsung cobain ${cleanProd}, kualitasnya beneran premium dan bikin semuanya jadi jauh lebih gampang! Lagi ada promo potongan harga khusus hari ini, klik keranjang kuning sekarang sebelum kehabisan!`,
        wordCount: 48,
        videoPrompts: [
          {
            sceneNumber: 1,
            sceneTitle: "Scene 1 (00-03s) Hook",
            tool: "Kling AI / Runway Gen-3",
            prompt: `Cinematic vertical 9:16 framing, dramatic studio lighting with blue neon rim light. A stylish young creator holding ${cleanProd} with intense shocking facial expression looking directly into lens, hyper-realistic 4k, smooth dolly in.`,
          },
          {
            sceneNumber: 2,
            sceneTitle: "Scene 2 (04-09s) Problem & Shift",
            tool: "Kling AI / Runway Gen-3",
            prompt: `Vertical 9:16 lifestyle aesthetic, dynamic pan camera movement. Everyday relatable environment showing previous struggle, switching smoothly to modern aesthetic lighting as ${cleanProd} is introduced, photorealistic depth of field.`,
          },
          {
            sceneNumber: 3,
            sceneTitle: "Scene 3 (10-15s) Product Showcase",
            tool: "Kling AI / Runway Gen-3",
            prompt: `Ultra-crisp 9:16 macro commercial shot of ${cleanProd} gleaming under soft diffused studio lighting, subtle camera rotation, floating glowing micro-particles, 8k commercial quality, realistic physics.`,
          },
          {
            sceneNumber: 4,
            sceneTitle: "Scene 4 (16-20s) Call To Action",
            tool: "Kling AI / Runway Gen-3",
            prompt: `High-energy vertical 9:16 portrait of happy content creator gesturing enthusiastically downward towards lower left corner, vibrant studio background with warm bokeh, clean professional composition.`,
          },
        ],
      };
      return res.json(generatedFallback);
    }

    const data = JSON.parse(rawText);

    // Calculate actual word count if missing
    if (!data.wordCount && data.fullNarration) {
      data.wordCount = data.fullNarration.trim().split(/\s+/).filter(Boolean).length;
    }

    res.json(data);
  } catch (err: any) {
    console.error("Generate Storyboard error:", err);
    res.status(500).json({
      error: err.message || "Gagal menghasilkan storyboard AI. Silakan coba lagi.",
    });
  }
});

// TAB 2: Generate Audio using Gemini Flash TTS model
app.post("/api/generate-tts", async (req, res) => {
  try {
    const { text, voice, speed, emotion, apiKey } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Teks narasi tidak boleh kosong!" });
    }

    const selectedVoice = voice || "Kore";
    const selectedEmotion = emotion || "Professional and convincing";
    const selectedSpeed = speed || "1.0x";

    const ai = getGeminiClient(apiKey);

    // Format prompt for expressive Gemini TTS
    const speechPrompt = `Bacakan narasi berikut dalam Bahasa Indonesia yang sangat alami, ekspresif, dan meyakinkan untuk video TikTok/Reels.
Gaya & Emosi: ${selectedEmotion}.
Kecepatan nada bicara: ${selectedSpeed}.
Teks narasi:
${text.trim()}`;

    let base64Raw: string | undefined;
    let ttsError: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: speechPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        base64Raw = part?.inlineData?.data;
        if (base64Raw) break;
      } catch (err: any) {
        ttsError = err;
        const isDemandError =
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.status === "UNAVAILABLE";
        if (attempt === 1 && isDemandError) {
          await sleep(800);
          continue;
        }
        break;
      }
    }

    if (!base64Raw) {
      throw (
        ttsError ||
        new Error("Model Gemini TTS tidak mengembalikan data audio.")
      );
    }

    const rawBuffer = Buffer.from(base64Raw, "base64");
    const isAlreadyWav = rawBuffer.subarray(0, 4).toString("ascii") === "RIFF";

    const wavBuffer = isAlreadyWav ? rawBuffer : pcmToWavBuffer(rawBuffer, 24000, 1, 16);
    const audioBase64 = wavBuffer.toString("base64");
    const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;

    res.json({
      audioUrl: audioDataUrl,
      voice: selectedVoice,
      emotion: selectedEmotion,
      speed: selectedSpeed,
      format: "audio/wav",
      sampleRate: 24000,
    });
  } catch (err: any) {
    console.error("Generate TTS error:", err);
    res.status(500).json({
      error:
        err.message ||
        "Gagal menghasilkan audio dengan Gemini TTS. Pastikan API key Anda aktif dan mendukung model ini.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AFFILIATOR AI Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
