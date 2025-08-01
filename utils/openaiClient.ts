import OpenAI from 'openai';

/**
 * Singleton OpenAI client to avoid recreating instances in API routes
 * Improves performance and reduces resource usage
 */

class OpenAIClient {
  private static instance: OpenAI | null = null;

  static getInstance(): OpenAI {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
      });
    }
    return OpenAIClient.instance;
  }

  static hasValidApiKey(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}

export const openaiClient = OpenAIClient.getInstance();
export const hasValidOpenAIKey = OpenAIClient.hasValidApiKey;

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