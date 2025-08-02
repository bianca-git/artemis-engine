import { NextResponse } from 'next/server';
import { openaiClient } from '../../../utils/openaiClient';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';

// Maximum length for heading detection in blog content
const MAX_HEADING_LENGTH = 80;

export async function POST(request: Request) {
  const { topic, stream = false } = await request.json();

  if (stream) {
    return NextResponse.json({ error: 'Streaming blog generation is not implemented.' }, { status: 501 });
  }

  try {
    const response = await openaiClient.responses.create({
      prompt: {
        id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
        version: "9",
        variables: {
          title: topic?.TITLE || "",
          content: topic?.CONTENT || ""
        }
      }
    });

    let portableTextContent: any[] = [];
    let rawContent = response?.output_text || "";

    // Convert Markdown to Portable Text
    portableTextContent = markdownToPortableText(rawContent, topic?.TITLE || "");

    return NextResponse.json({
      portableText: portableTextContent
    });
  } catch (error) {
    console.error('Blog generation error:', error);

    // Return a fallback response with empty but valid Portable Text structure
    return NextResponse.json({
      portableText: [],
      error: 'Failed to generate blog content. Please try again.'
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
      _type: 'block',
      _key: uuidv4(),
      style: 'h1',
      children: [
        {
          _type: 'span',
          _key: uuidv4(),
          text: title.trim(),
          marks: []
        }
      ]
    });
  }

  tokens.forEach((token, idx) => {
    if (token.type === 'heading') {
      blocks.push({
        _type: 'block',
        _key: uuidv4(),
        style: `h${token.depth}`,
        children: parseInlineMarkdown(token.text)
      });
    } else if (token.type === 'paragraph') {
      blocks.push({
        _type: 'block',
        _key: uuidv4(),
        style: 'normal',
        children: parseInlineMarkdown(token.text)
      });
    } else if (token.type === 'list') {
      token.items.forEach((item: any) => {
        blocks.push({
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          listItem: token.ordered ? 'number' : 'bullet',
          level: 1,
          children: parseInlineMarkdown(item.text)
        });
      });
    } else if (token.type === 'blockquote') {
      blocks.push({
        _type: 'block',
        _key: uuidv4(),
        style: 'blockquote',
        children: parseInlineMarkdown(token.text)
      });
    }
    // Add more token types as needed (code, hr, etc.)
  });

  // If no blocks were created, add a default empty block
  if (blocks.length === 0) {
    blocks.push({
      _type: 'block',
      _key: uuidv4(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: uuidv4(),
          text: 'No content generated. Please try again.',
          marks: []
        }
      ]
    });
  }

  return blocks;
}

// Helper to parse inline markdown for bold, italics, and bold-italics
function parseInlineMarkdown(text: string) {
  // This regex matches **bold**, *italic*, and ***bolditalic*** (in any order)
  // and also handles _ and __ as markdown allows both
  const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
  const spans: any[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      spans.push({
        _type: 'span',
        _key: uuidv4(),
        text: text.slice(lastIndex, match.index),
        marks: []
      });
    }

    let markType: string[] = [];
    let content = '';

    if (match[1]) { // ***bolditalic*** or ___bolditalic___
      markType = ['strong', 'em'];
      content = match[2];
    } else if (match[3]) { // **bold** or __bold__
      markType = ['strong'];
      content = match[4];
    } else if (match[5]) { // *italic* or _italic_
      markType = ['em'];
      content = match[6];
    }

    spans.push({
      _type: 'span',
      _key: uuidv4(),
      text: content,
      marks: markType
    });

    lastIndex = regex.lastIndex;
    keyIndex++;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    spans.push({
      _type: 'span',
      _key: uuidv4(),
      text: text.slice(lastIndex),
      marks: []
    });
  }

  return spans;
}
