import { GoogleGenAI } from "@google/genai";

// Standard model candidates
export const DEFAULT_MODEL_CANDIDATES = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
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

function extractJson(text: string): any {
  if (!text) return null;
  const clean = text.trim();
  try {
    return JSON.parse(clean);
  } catch {
    // try regex extraction
    const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || clean.match(/([\{\[][\s\S]*[\}\]])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
  fallbackGenerator?: () => any;
}) {
  const ai = getGeminiClient();

  if (ai) {
    const modelList = params.preferredModel
      ? [params.preferredModel, ...DEFAULT_MODEL_CANDIDATES.filter(m => m !== params.preferredModel)]
      : DEFAULT_MODEL_CANDIDATES;

    // 1. Try standard generateContent API first (fast & supports responseSchema)
    for (const modelName of modelList) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        const msg = String(err?.message || err || "");
        // If project access is denied (403) or key is invalid (401), do not waste time retrying other models
        if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("401") || msg.includes("API_KEY_INVALID")) {
          break;
        }
      }
    }
  }

  // 2. Graceful Fallback if API access is restricted (e.g., 403 PERMISSION_DENIED / quota)
  if (params.fallbackGenerator) {
    const generated = params.fallbackGenerator();
    return {
      text: JSON.stringify(generated)
    };
  }

  throw new Error("Layanan AI sedang tidak tersedia. Silakan coba kembali sesaat lagi.");
}

export { extractJson };
