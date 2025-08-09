import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";
import { openaiClient } from "utils/openaiClient";
import { normalizeAIOptions } from 'utils/aiConfig';
import { checkRateLimit } from 'utils/rateLimit';
import { logger } from 'utils/logger';
import path from "path";
import fs from "fs/promises";

// Memory / size safety guards (can be overridden per request)
const DEFAULT_MAX_OUTPUT_CHARS = 20000; // legacy default
const HARD_MAX_OUTPUT_CHARS = 60000;    // absolute safety ceiling to avoid runaway memory
// Streaming buffer: give a bit of headroom above requested cap (will be computed dynamically)
const STREAM_BUFFER = 1500;
// Maximum length for heading detection in blog content (currently unused but kept for future logic)
const MAX_HEADING_LENGTH = 80;

// Cache the developer prompt to avoid re-reading on every request
let cachedPrompt: string | null = null;

async function getDeveloperPrompt() {
  if (cachedPrompt) return cachedPrompt;
  try {
    const filePath = path.join(process.cwd(), 'app', 'api', 'generate-blog', 'generate-blog-prompt.md');
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


export async function POST(request: Request) {
  const { topic, stream = false, model, verbosity, reasoningEffort, maxChars, full = false, includeRaw = false }: { topic: any; stream?: boolean; model?: string; verbosity?: 'low'|'medium'|'high'; reasoningEffort?: 'minimal'|'low'|'medium'|'high'; maxChars?: number; full?: boolean; includeRaw?: boolean } = await request.json();
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon';
  const rl = checkRateLimit(`blog:${ip}`, 5, 60_000); // 5 blog generations per minute
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try later.' }, { status: 429 });
  }
  const ai = normalizeAIOptions('blog', { model, verbosity, reasoningEffort });

  // Determine requested character cap
  const requestedCap = (() => {
    if (full) return HARD_MAX_OUTPUT_CHARS; // user explicitly wants the maximum allowed
    if (maxChars && maxChars > 0) return Math.min(Math.max(2000, maxChars), HARD_MAX_OUTPUT_CHARS);
    return DEFAULT_MAX_OUTPUT_CHARS;
  })();

  if (stream) {
    const encoder = new TextEncoder();

    const rs = new ReadableStream({
      async start(controller) {
        const abortController = new AbortController();
        let total = 0;
        let closed = false;
        let bytesSent = 0;
        const endSentinel = '\n[END]\n';
        const streamCap = requestedCap + STREAM_BUFFER; // allow slight overflow for clean sentence completion
        const safeEnqueue = (chunk: string) => {
          if (closed) return;
          if (!chunk) return;
          total += chunk.length;
          if (total > streamCap) {
            controller.enqueue(encoder.encode('\n...[truncated]\n'));
            controller.enqueue(encoder.encode(endSentinel));
            closed = true;
            abortController.abort();
            controller.close();
            return;
          }
          controller.enqueue(encoder.encode(chunk));
          bytesSent += chunk.length;
        };
        try {
          const developerPrompt = await getDeveloperPrompt();
          const reasoningParam = ai.reasoning?.effort === 'minimal'
            ? { effort: 'low' as any }
            : ai.reasoning;
          const res = await openaiClient.responses.stream({
            model: ai.model,
            input: [
              { role: "developer", content: [ { type: "input_text", text: developerPrompt } ] },
              { role: "user", content: [ { type: "input_text", text: buildUserPrompt(topic, requestedCap, full) } ] }
            ],
            text: ai.text,
            tools: [],
            store: false,
            signal: abortController.signal as any
          });

          for await (const event of res) {
            const type = (event as any).type;
            switch (type) {
              case 'response.output_text.delta':
                safeEnqueue((event as any).delta as string);
                if (closed) break;
                break;
              case 'response.refusal.delta':
              case 'response.refusal':
                safeEnqueue('\n[refused]\n');
                safeEnqueue(endSentinel);
                closed = true;
                abortController.abort();
                break;
              case 'response.completed':
                safeEnqueue(endSentinel);
                closed = true;
                break;
              case 'response.completed_with_error':
              case 'response.error':
                if (!bytesSent) {
                  safeEnqueue('\n[error]\n');
                }
                safeEnqueue(endSentinel);
                closed = true;
                break;
              case 'response.truncated':
                safeEnqueue('\n[truncated]\n');
                safeEnqueue(endSentinel);
                closed = true;
                break;
              default:
                // Ignore other event types silently (tool calls, reasoning tokens) for now
                break;
            }
            if (closed) break;
          }
          if (!closed) {
            safeEnqueue(endSentinel);
            closed = true;
          }
          controller.close();
        } catch (err: any) {
          if (!closed) {
            if (!bytesSent) {
              safeEnqueue('[stream-internal-error]\n');
            }
            safeEnqueue(endSentinel);
            closed = true;
            controller.close();
          }
        }
      }
    });

    return new Response(rs, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Fallback to non-streaming logic (existing code, now enhanced)
  try {
      const developerPrompt = await getDeveloperPrompt();
    const reasoningParam = ai.reasoning?.effort === 'minimal'
      ? { effort: 'low' as any }
      : ai.reasoning;
    // Heuristic: approximate tokens ~ chars / 4
    const maxOutputTokens = Math.min(8192, Math.ceil(requestedCap / 4));
    const response = await openaiClient.responses.create({
      model: ai.model,
      input: [
        {
          role: "developer",
          content: [ { type: "input_text", text: developerPrompt } ]
        },
        {
          role: "user",
          content: [ { type: "input_text", text: buildUserPrompt(topic, requestedCap, full) } ]
        }
      ],
  text: ai.text,
      tools: [],
      store: false,
      // Attempt to constrain token usage if supported
      max_output_tokens: maxOutputTokens as any
    });

    let rawContent = (response as any)?.output_text || "";
    if (rawContent.length > requestedCap) {
      rawContent = rawContent.slice(0, requestedCap) + "\n...[truncated]\n";
    }
    const portableTextContent = markdownToPortableText(rawContent, topic?.TITLE || "");

    logger.info('generate_blog_success', { ip, model: ai.model, titleLen: (topic?.TITLE || '').length });
    return NextResponse.json({
      model: ai.model,
      verbosity: ai.text.verbosity || 'medium',
      reasoningEffort: ai.reasoning?.effort || 'medium',
      portableText: portableTextContent,
      ...(includeRaw ? { raw: rawContent } : {})
    });
  } catch (error) {
    console.error("Blog generation error:", error);

    // Return a fallback response with empty but valid Portable Text structure
    return NextResponse.json({
      portableText: [],
      error: "Failed to generate blog content. Please try again.",
    });
  }
}

// Converts Markdown string to Portable Text blocks
function markdownToPortableText(markdown: string, title: string) {
  // Guard: extremely large markdown could blow memory; hard cap applied earlier but double check
  if (markdown.length > HARD_MAX_OUTPUT_CHARS * 1.2) {
    markdown = markdown.slice(0, HARD_MAX_OUTPUT_CHARS) + "\n...[truncated]\n";
  }

  const tokens = marked.lexer(markdown);
  const blocks: any[] = [];

  // Add title as h1 if provided
  if (title && title.trim()) {
    blocks.push({
      _type: "block",
      _key: uuidv4(),
      style: "h1",
      children: [
        {
          _type: "span",
          _key: uuidv4(),
          text: title.trim(),
          marks: [],
        },
      ],
    });
  }

  tokens.forEach((token, idx) => {
    if (token.type === "heading") {
      blocks.push({
        _type: "block",
        _key: uuidv4(),
        style: `h${token.depth}`,
        children: parseInlineMarkdown(token.text),
      });
    } else if (token.type === "paragraph") {
      blocks.push({
        _type: "block",
        _key: uuidv4(),
        style: "normal",
        children: parseInlineMarkdown(token.text),
      });
    } else if (token.type === "list") {
      token.items.forEach((item: any) => {
        blocks.push({
          _type: "block",
          _key: uuidv4(),
          style: "normal",
          listItem: token.ordered ? "number" : "bullet",
          level: 1,
          children: parseInlineMarkdown(item.text),
        });
      });
    } else if (token.type === "blockquote") {
      blocks.push({
        _type: "block",
        _key: uuidv4(),
        style: "blockquote",
        children: parseInlineMarkdown(token.text),
      });
    } else if (token.type === 'code') {
      blocks.push({
        _type: 'code',
        _key: uuidv4(),
        language: (token as any).lang || 'text',
        code: (token as any).text || ''
      });
    }
    // Add more token types as needed (code, hr, etc.)
  });

  // If no blocks were created, add a default empty block
  if (blocks.length === 0) {
    blocks.push({
      _type: "block",
      _key: uuidv4(),
      style: "normal",
      children: [
        {
          _type: "span",
          _key: uuidv4(),
          text: "No content generated. Please try again.",
          marks: [],
        },
      ],
    });
  }

  return blocks;
}

// Helper to parse inline markdown for bold, italics, and bold-italics
function parseInlineMarkdown(text: string) {
  // Recreate regex each invocation to avoid lastIndex state leaks / memory retention
  const pattern = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
  const spans: any[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      spans.push({ _type: "span", _key: uuidv4(), text: text.slice(lastIndex, match.index), marks: [] });
    }
    let markType: string[] = [];
    let content = "";
    if (match[1]) { markType = ["strong", "em"]; content = match[2]; }
    else if (match[3]) { markType = ["strong"]; content = match[4]; }
    else if (match[5]) { markType = ["em"]; content = match[6]; }

    if (content) {
      // Do a shallow nested parse only once to avoid deep recursion on huge text
      const nested = /(\*\*|__|\*|_)/.test(content) && content.length < 500 ? parseInlineMarkdown(content) : null;
      if (nested) {
        nested.forEach((s: any) => {
          s.marks = Array.from(new Set([...(s.marks || []), ...markType]));
          spans.push(s);
        });
      } else {
        spans.push({ _type: "span", _key: uuidv4(), text: content, marks: markType });
      }
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    spans.push({ _type: "span", _key: uuidv4(), text: text.slice(lastIndex), marks: [] });
  }
  return spans;
}

// Build user prompt based on requested cap / full flag
function buildUserPrompt(topic: any, requestedCap: number, full: boolean) {
  const title = topic?.TITLE || '';
  const base = `Write a detailed, well-structured blog post titled "${title}" using the following context: ${topic?.CONTENT || ''}.`;
  if (full) {
    return base + ' Provide comprehensive coverage; do not artificially shorten. Aim for natural completeness.';
  }
  // Convert char cap to an approximate word target (chars / 5) for model guidance
  const approxWords = Math.round(requestedCap / 5);
  return base + ` Keep output under ${requestedCap} characters (approx ${approxWords} words) without cutting mid-sentence.`;
}
