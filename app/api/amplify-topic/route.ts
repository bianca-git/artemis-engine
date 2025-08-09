import { NextResponse } from 'next/server';
import { hasValidOpenAIKey, openaiClient } from 'utils/openaiClient';
import fs from 'fs/promises';
import path from 'path';

/**
 * Optimized topic amplification API with input validation and error handling
 */

// Cache the developer prompt to avoid re-reading on every request
let cachedPrompt: string | null = null;

async function getDeveloperPrompt() {
  if (cachedPrompt) return cachedPrompt;
  try {
    const filePath = path.join(process.cwd(), 'app', 'api', 'amplify-topic', 'amplify-topic-prompt.md');
    const raw = await fs.readFile(filePath, 'utf8');
    // We only need the instruction text; keep as-is (model will get full context)
    cachedPrompt = raw.trim();
    return cachedPrompt;
  } catch (err) {
    console.error('Failed to read amplify-topic-prompt.md:', err);
    cachedPrompt = '';
    return cachedPrompt;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Input validation
    if (!body.keyword?.trim()) {
      return NextResponse.json({
        error: 'Keyword is required'
      }, { status: 400 });
    }

    const keyword = body.keyword.trim();

    // Return mock data if no API key
    const mockResponse = {
      ideas: `Mock ideas for keyword: ${keyword}. Here are some creative topic suggestions based on your keyword.`
    };

    if (!hasValidOpenAIKey()) {
      return NextResponse.json(mockResponse);
    }

    try {
      const developerPrompt = await getDeveloperPrompt();
      const response = await openaiClient.responses.create({
        model: "gpt-5-nano",
        input: [
          {
            role: "developer",
            content: [
              {
                type: "input_text",
                text: developerPrompt
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `${keyword}`
              }
            ]
          }
        ],
        text: {
          format: { type: "text" }
        },
        reasoning: {
          effort: "medium"
        },
        tools: [],
        store: true
      });

      console.log("Amplify response returned in route.ts");

      return NextResponse.json({
        ideas: (response as any)?.output_text || mockResponse.ideas
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(mockResponse); // Return mock data on OpenAI error
    }

  } catch (error) {
    console.error('Topic amplification error:', error);
    return NextResponse.json({
      error: 'Invalid request format'
    }, { status: 400 });
  }
}
