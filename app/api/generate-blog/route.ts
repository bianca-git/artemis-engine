import { NextResponse } from "next/server";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";
import { openaiClient } from "utils/openaiClient";

// Maximum length for heading detection in blog content
const MAX_HEADING_LENGTH = 80;

export async function POST(request: Request) {
  const { topic, stream = false } = await request.json();

  if (stream) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const openai = new OpenAI();
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: topic }],
          stream: true,
        });

        for await (const part of res) {
          const text = part.choices?.[0].delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
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
    const response = await openaiClient.responses.create({
      prompt: {
        id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
        version: "9",
        variables: {
          title: topic?.TITLE || "",
          content: topic?.CONTENT || "",
        },
      },
    });

    let portableTextContent: any[] = [];
    let rawContent = response?.output_text || "";

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

// Helper to parse inline markdown for bold, italics, and bold-italics (Iterative)
function parseInlineMarkdown(text: string): any[] {
  const finalSpans: any[] = [];
  // Use a queue for breadth-first processing to maintain order and avoid deep recursion.
  const queue: { text: string; marks: string[] }[] = [{ text, marks: [] }];
  let queueIndex = 0;

  // The regex is kept from the original implementation.
  const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;

  while (queueIndex < queue.length) {
    const { text: currentText, marks: parentMarks } = queue[queueIndex];
    queueIndex++;

    let lastIndex = 0;
    let hasMatches = false;
    const segments = [];

    // Use a new regex instance for each iteration of the text.
    const localRegex = new RegExp(regex);
    let match;

    while ((match = localRegex.exec(currentText)) !== null) {
      hasMatches = true;
      // 1. Add the text segment before the current match.
      if (match.index > lastIndex) {
        segments.push({
          text: currentText.slice(lastIndex, match.index),
          marks: parentMarks,
          isLeaf: true, // This segment won't be processed further.
        });
      }

      // 2. Determine the marks and content for the matched segment.
      let content = "";
      let newMarks: string[] = [];
      if (match[1]) {
        // ***bolditalic*** or ___bolditalic___
        newMarks = ["strong", "em"];
        content = match[2];
      } else if (match[3]) {
        // **bold** or __bold__
        newMarks = ["strong"];
        content = match[4];
      } else if (match[5]) {
        // *italic* or _italic_
        newMarks = ["em"];
        content = match[6];
      }

      // 3. Add the nested content to be processed further.
      segments.push({
        text: content,
        marks: Array.from(new Set([...parentMarks, ...newMarks])),
        isLeaf: false, // This segment will be pushed to the queue.
      });

      lastIndex = localRegex.lastIndex;
    }

    // 4. If no matches were found in the current text, it's a final leaf node.
    if (!hasMatches) {
      if (currentText) {
        finalSpans.push({
          _type: "span",
          _key: uuidv4(),
          text: currentText,
          marks: parentMarks,
        });
      }
    } else {
      // 5. Add any remaining text after the last match.
      if (lastIndex < currentText.length) {
        segments.push({
          text: currentText.slice(lastIndex),
          marks: parentMarks,
          isLeaf: true,
        });
      }

      // 6. Process the collected segments.
      for (const segment of segments) {
        if (segment.isLeaf) {
          // Leaf nodes are added directly to the final result.
          if (segment.text) {
            finalSpans.push({
              _type: "span",
              _key: uuidv4(),
              text: segment.text,
              marks: segment.marks,
            });
          }
        } else {
          // Non-leaf nodes are added to the queue for further processing.
          queue.push({ text: segment.text, marks: segment.marks });
        }
      }
    }
  }

  return finalSpans;
}
