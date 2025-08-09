import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";
import { openaiClient } from "utils/openaiClient";
import path from "path";
import fs from "fs/promises";

// Maximum length for heading detection in blog content
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
  const { topic, stream = false } = await request.json();

  if (stream) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const developerPrompt = await getDeveloperPrompt();
          const res = await openaiClient.responses.stream({
            model: "gpt-4o-mini",
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
                    text: `Write a detailed blog post titled "${topic?.TITLE || ''}". Content: ${topic?.CONTENT || ''}.`
                  }
                ]
              }
            ],
            text: { format: { type: "text" } },
            reasoning: { effort: "high" },
            tools: [],
            store: true
          });

          for await (const event of res) {
            if ((event as any).type === "response.output_text.delta") {
              const delta = (event as any).delta as string;
              if (delta) controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Fallback to non-streaming logic (existing code)
  try {
      const developerPrompt = await getDeveloperPrompt();
    const response = await openaiClient.responses.create({
      model: "gpt-4o-mini",
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
              text: `Write a detailed blog post titled "${topic?.TITLE || ''}". Content: ${topic?.CONTENT || ''}.`
            }
          ]
        }
      ],
      text: {
        format: { type: "text" }
      },
      reasoning: {
        effort: "high"
      },
      tools: [],
      store: true
    });

    let portableTextContent: any[] = [];
    let rawContent = (response as any)?.output_text || "";

    // Convert Markdown to Portable Text
    portableTextContent = markdownToPortableText(rawContent, topic?.TITLE || "");

    return NextResponse.json({
      portableText: portableTextContent,
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
  // This regex matches ***bolditalic***, **bold**, *italic*, and also handles _ and __ as markdown allows both
  // It also supports combinations like _**Name, Lock, Communicate:**_
  const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
  const spans: any[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      spans.push({
        _type: "span",
        _key: uuidv4(),
        text: text.slice(lastIndex, match.index),
        marks: [],
      });
    }

    let markType: string[] = [];
    let content = "";

    if (match[1]) {
      // ***bolditalic*** or ___bolditalic___
      markType = ["strong", "em"];
      content = match[2];
    } else if (match[3]) {
      // **bold** or __bold__
      markType = ["strong"];
      content = match[4];
    } else if (match[5]) {
      // *italic* or _italic_
      markType = ["em"];
      content = match[6];
    }

    // Recursively parse for nested marks (e.g., _**text**_)
    const innerSpans =
      content && regex.test(content)
        ? parseInlineMarkdown(content)
        : [
            {
              _type: "span",
              _key: uuidv4(),
              text: content,
              marks: markType,
            },
          ];

    // If recursive, apply marks to all inner spans
    if (Array.isArray(innerSpans)) {
      innerSpans.forEach((span: any) => {
        // Merge marks if not already present
        span.marks = Array.from(new Set([...(span.marks || []), ...markType]));
        spans.push(span);
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    spans.push({
      _type: "span",
      _key: uuidv4(),
      text: text.slice(lastIndex),
      marks: [],
    });
  }

  return spans;
}
