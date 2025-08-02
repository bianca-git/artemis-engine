import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// No longer needed: always use OpenAI
export async function POST(request: Request) {
  const { topic, stream = false } = await request.json();

  if (stream) {
    return NextResponse.json({ error: 'Streaming blog generation is not implemented.' }, { status: 501 });
  }

  try {
    const response = await openai.responses.create({
      prompt: {
        id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
        version: "7",
        variables: {
          title: topic?.TITLE || "",
          content: topic?.CONTENT || ""
        }
      }
    });

    let portableTextContent: any[] = [];
    let rawContent = response?.output_text || "";
    portableTextContent = JSON.parse(rawContent);

    return NextResponse.json({
      content: rawContent, // Keep for backward compatibility
      portableText: portableTextContent
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json({ error: 'Failed to generate blog content.' });
  }
}


function convertToPortableText(htmlContent: string, title: string) {
  // Simple conversion - split and filter content into paragraphs in a single step
  const lines = [];
  for (const line of htmlContent.split('\n')) {
    if (line.trim()) {
      lines.push(line);
    }
  }
  
  const blocks = [];
  
  // Only add title block if title is not empty
  if (title && title.trim()) {
    blocks.push({
      _type: 'block',
      _key: 'title',
      style: 'h1',
      children: [
        {
          _type: 'span',
          _key: 'title-span',
          text: title.trim(),
          marks: []
        }
      ]
    });
  }
  
  // Convert content lines to paragraphs
  lines.forEach((line, index) => {
    if (line.trim()) {
      // Check if line looks like a heading
      const isHeading = line.startsWith('#') || line.match(/^[A-Z][^.]*:?\s*$/);
      
      blocks.push({
        _type: 'block',
        _key: `block-${index}`,
        style: isHeading ? 'h2' : 'normal',
        children: [
          {
            _type: 'span',
            _key: `span-${index}`,
            text: line.replace(/^#+\s*|^[A-Z][^.]*:?\s*/, ''), // Remove markdown headers and other heading patterns
            marks: []
          }
        ]
      });
    }
  });
  
  return blocks;
}
