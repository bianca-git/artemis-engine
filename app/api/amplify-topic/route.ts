import { NextResponse } from 'next/server';
import { hasValidOpenAIKey, openaiClient } from 'utils/openaiClient';
import { normalizeAIOptions } from 'utils/aiConfig';
import { checkRateLimit } from 'utils/rateLimit';
import { logger } from 'utils/logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * Optimized topic amplification API with input validation and error handling
 */

// Cache the developer prompt to avoid re-reading on every request
let cachedPrompt: string | null = null;

// Output guard
const MAX_IDEAS_CHARS = 4000;

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
  const body: { keyword?: string; model?: string; verbosity?: 'low'|'medium'|'high'; reasoningEffort?: 'minimal'|'low'|'medium'|'high'; maxChars?: number } = await request.json();

    // Rate limit (per IP extracted from headers, fallback to anonymous)
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon';
    const rl = checkRateLimit(`amplify:${ip}`, 10, 60_000); // 10 req / minute
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try later.' }, { status: 429 });
    }

    // Input validation
    if (!body.keyword?.trim()) {
      return NextResponse.json({
        error: 'Keyword is required'
      }, { status: 400 });
    }

  const keyword = body.keyword.trim();
  const ai = normalizeAIOptions('amplify', { model: body.model, verbosity: body.verbosity, reasoningEffort: body.reasoningEffort });

    // Return mock data if no API key
  const mockResponse = {
      ideas: `Mock ideas for keyword: ${keyword}. Here are some creative topic suggestions based on your keyword.`
    };

    if (!hasValidOpenAIKey()) {
      return NextResponse.json(mockResponse);
    }

    try {
      const developerPrompt = await getDeveloperPrompt();
      // Map 'minimal' to 'low' for SDK types if SDK hasn't added 'minimal' yet
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
        text: ai.text,
  reasoning: reasoningParam as any,
  tools: [],
  store: false
      });

      console.log("Amplify response returned in route.ts");

      let ideas = (response as any)?.output_text || mockResponse.ideas;
      const cap = Math.min(Math.max(500, body.maxChars || MAX_IDEAS_CHARS), 20000);
      if (ideas.length > cap) {
        ideas = ideas.slice(0, cap) + '\n...[truncated]\n';
      }
      logger.info('amplify_topic_success', { ip, keywordLength: keyword.length, model: ai.model, verbosity: ai.text.verbosity || 'medium' });

  // Persist ideas by overwriting public/defaultData.csv (single canonical copy used by client & server).
  // We attempt a naive parse: split on newlines and wrap each idea as a CSV row.
      try {
        const ideasArray: string[] = Array.isArray(ideas)
          ? ideas
          : String(ideas)
              .split(/\n+/)
              .map(l => l.trim())
              .filter(l => l.length > 0);

        if (ideasArray.length > 0) {
          // Build CSV with headers matching existing expectation
          // ID,TITLE,CONTENT,VISUAL (VISUAL left blank for now)

          const csv = `${ideasArray.join('\n')}`;

          const root = process.cwd();
          const publicCsvPath = path.join(root, 'public', 'defaultData.csv');
          await fs.writeFile(publicCsvPath, csv, 'utf8');
        }
      } catch (persistErr) {
        logger.error('amplify_topic_persist_error', { err: (persistErr as any)?.message || String(persistErr) });
      }

      return NextResponse.json({
        model: ai.model,
        verbosity: ai.text.verbosity || 'medium',
        reasoningEffort: ai.reasoning?.effort || 'medium',
        ideas
      });

    } catch (openaiError) {
      logger.error('amplify_topic_openai_error', { err: (openaiError as any)?.message || String(openaiError) });
      return NextResponse.json(mockResponse); // Return mock data on OpenAI error
    }

  } catch (error) {
    logger.error('amplify_topic_route_error', { err: (error as any)?.message || String(error) });
    return NextResponse.json({
      error: 'Invalid request format'
    }, { status: 400 });
  }
}
