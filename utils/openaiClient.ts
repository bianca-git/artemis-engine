import OpenAI from "openai";

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export function hasValidOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
}

/**
 * Common OpenAI request wrapper with error handling
 */
export async function makeOpenAIRequest<T>(
  requestFn: (client: OpenAI) => Promise<T>,
  mockResponse: T
): Promise<T> {
  if (!hasValidOpenAIKey()) {
    return mockResponse;
  }

  try {
    return await requestFn(openaiClient);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return mock response on error instead of throwing
    return mockResponse;
  }
}