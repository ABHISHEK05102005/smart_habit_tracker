import { GoogleGenAI } from "@google/genai";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Helper to interact with any available LLM
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const { GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY } = process.env;

  if (GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: fullPrompt,
    });
    return response.text || "";
  }

  if (OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt } as const] : []),
        { role: "user", content: prompt },
      ],
    });
    return response.choices[0]?.message?.content || "";
  }

  if (ANTHROPIC_API_KEY) {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    return (response.content[0] as any).text || "";
  }

  throw new Error("No LLM API keys found in environment.");
}
