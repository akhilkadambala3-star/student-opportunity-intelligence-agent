import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIProviderStatus {
  isConfigured: boolean;
  provider: "GEMINI_LIVE" | "DEMO_DETERMINISTIC";
  modelName: string;
  statusMessage: string;
}

export function getAIProviderStatus(): AIProviderStatus {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    return {
      isConfigured: true,
      provider: "GEMINI_LIVE",
      modelName: "gemini-1.5-flash",
      statusMessage: "Live Gemini AI provider active (server-side authenticated).",
    };
  }

  return {
    isConfigured: false,
    provider: "DEMO_DETERMINISTIC",
    modelName: "deterministic-rule-engine-v1",
    statusMessage: "Demo Mode active: deterministic analysis engine running with verified seed logic.",
  };
}

export async function callGeminiJSON<T>(prompt: string, fallbackGenerator: () => T): Promise<{ data: T; source: "GEMINI_LIVE" | "DEMO_DETERMINISTIC" }> {
  const status = getAIProviderStatus();

  if (!status.isConfigured) {
    return {
      data: fallbackGenerator(),
      source: "DEMO_DETERMINISTIC",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as T;

    return {
      data: parsed,
      source: "GEMINI_LIVE",
    };
  } catch (error) {
    console.warn("Gemini Live API call failed or timed out. Falling back to deterministic engine:", error);
    return {
      data: fallbackGenerator(),
      source: "DEMO_DETERMINISTIC",
    };
  }
}
