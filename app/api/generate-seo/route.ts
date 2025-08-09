import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';
import { normalizeAIOptions } from 'utils/aiConfig';
import { checkRateLimit } from 'utils/rateLimit';
import { logger } from 'utils/logger';
import path from 'path';
import fs from 'fs/promises';

// Cache the developer prompt to avoid re-reading on every request
let cachedPrompt: string | null = null;

async function getDeveloperPrompt() {
  if (cachedPrompt) return cachedPrompt;
  try {
    const filePath = path.join(process.cwd(), 'app', 'api', 'generate-seo', 'generate-seo-prompt.md');
    const raw = await fs.readFile(filePath, 'utf8');
    // We only need the instruction text; keep as-is (model will get full context)
    cachedPrompt = raw.trim();
    return cachedPrompt;
  } catch (err) {
    console.error('Failed to read generate-blog-prompt.md:', err);
    cachedPrompt = '';
    return cachedPrompt;
  }
}

/**
 * API route for generating SEO meta fields using OpenAI.
 * Returns: { metaTitle, metaDescription, keywords[] }
 */
const MAX_SEO_CHARS = 5000;

export async function POST(request: Request) {
  const { topic, model, verbosity, reasoningEffort, maxChars }: { topic: any; model?: string; verbosity?: 'low'|'medium'|'high'; reasoningEffort?: 'minimal'|'low'|'medium'|'high'; maxChars?: number } = await request.json();
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon';
  const rl = checkRateLimit(`seo:${ip}`, 20, 60_000); // 20 req/min
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try later.' }, { status: 429 });
  }
  const ai = normalizeAIOptions('seo', { model, verbosity, reasoningEffort });

  // Return mock data if no API key (for build/dev)
  const mockResponse = {
    metaTitle: `Mock SEO title for ${topic?.TITLE || 'topic'}`,
    metaDescription: `Mock SEO description for ${topic?.TITLE || 'topic'}`,
    keywords: ["mock", "seo", "keywords", "example", "test"]
  };

  if (!hasValidOpenAIKey()) {
    return NextResponse.json(mockResponse);
  }

  try {
              const developerPrompt = await getDeveloperPrompt();

    // Basic keywords guidance string to help model produce valid JSON in grammar
    const developerAddon = developerPrompt + '\nStrictly output ONLY compact JSON with keys metaTitle (<=160 chars), metaDescription (<=320 chars), keywords (array <=20 strings, each 1-3 words). No commentary.';
    const reasoningParam = ai.reasoning?.effort === 'minimal'
      ? { effort: 'low' as any }
      : ai.reasoning;

    const response = await openaiClient.responses.create({
      model: ai.model,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: developerAddon
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Blog titled "${topic?.TITLE || ''}". Content is: ${topic?.CONTENT || ''}`
            }
          ]
        }
      ],
  text: ai.text,
  reasoning: reasoningParam as any,
  tools: [],
  store: false
    });

  // Prefer the SDK's aggregated output_text; fallback to scanning output items
  let outputText = (response as any)?.output_text || "";
    if (Array.isArray(response.output)) {
      for (const item of response.output) {
        // Some OpenAI SDKs use "content" array, but types may not reflect this.
        // Safely check for content array and extract output_text.
        const contentArr = (item as any)?.content;
        if (Array.isArray(contentArr)) {
          const textObj = contentArr.find((c: any) => c.type === "output_text" && typeof c.text === "string");
          if (textObj) {
            outputText = textObj.text;
            break;
          }
        }
      }
    }

  const cap = Math.min(Math.max(500, maxChars || MAX_SEO_CHARS), 15000);
  if (outputText.length > cap) {
    outputText = outputText.slice(0, cap) + '\n...[truncated]\n';
  }

  // Attempt robust extraction: grab first JSON object substring
  let jsonCandidate = outputText;
  const firstBrace = outputText.indexOf('{');
  const lastBrace = outputText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    jsonCandidate = outputText.slice(firstBrace, lastBrace + 1);
  }
  let meta: any;
  try {
    meta = JSON.parse(jsonCandidate);
  } catch {
    meta = {};
  }
  if (typeof meta !== 'object' || Array.isArray(meta) || !meta) meta = {};
  meta.metaTitle = typeof meta.metaTitle === 'string' ? meta.metaTitle : '';
  meta.metaDescription = typeof meta.metaDescription === 'string' ? meta.metaDescription : '';
  meta.keywords = Array.isArray(meta.keywords) ? meta.keywords.filter((k: any) => typeof k === 'string').slice(0, 25) : [];

  logger.info('generate_seo_success', { ip, model: ai.model, titleLen: (topic?.TITLE || '').length });
  return NextResponse.json({
    ...meta,
    model: ai.model,
    verbosity: ai.text.verbosity || 'medium',
    reasoningEffort: ai.reasoning?.effort || 'minimal'
  });
  } catch (e) {
    console.error('SEO generation error:', e);
    return NextResponse.json({
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      error: "Failed to generate SEO content"
    }, { status: 500 });
  }
}
