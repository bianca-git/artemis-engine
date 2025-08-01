
import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

export async function POST(request: Request) {
  const { topic } = await request.json();
  
  // Skip API call during build
  if (!process.env.OPENAI_API_KEY) {
    const mockContent = `This is a mock blog post about ${topic?.TITLE || 'a topic'}. ${topic?.CONTENT || 'Content will be generated here.'}`;
    return NextResponse.json({ 
      content: mockContent,
      portableText: convertToPortableText(mockContent, topic?.TITLE || "Sample Title")
    });
  }
  
  // Call OpenAI with prompt to generate content that we'll structure as Portable Text
  const response = await openai.responses.create({
    prompt: {
      id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
      version: "1", 
      variables: {
        title: topic?.TITLE || "",
        content: topic?.CONTENT || ""
      }
    }
  });
  
  const htmlContent = response?.output_text || "";
  
  // For now, let's create a simple Portable Text structure manually
  // This is a minimal implementation that converts the generated content to Portable Text
  const portableTextContent = convertToPortableText(htmlContent, topic?.TITLE || "");
  
  return NextResponse.json({ 
    content: htmlContent, // Keep HTML for backward compatibility during transition
    portableText: portableTextContent
  });
}

function convertToPortableText(htmlContent: string, title: string) {
  // Simple conversion - split content into paragraphs and create basic Portable Text structure
  const lines = htmlContent.split('\n').filter(line => line.trim());
  
  const blocks = [
    // Title block
    {
      _type: 'block',
      _key: 'title',
      style: 'h1',
      children: [
        {
          _type: 'span',
          _key: 'title-span',
          text: title,
          marks: []
        }
      ]
    }
  ];
  
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
            text: line.replace(/^#+\s*/, ''), // Remove markdown headers
            marks: []
          }
        ]
      });
    }
  });
  
  return blocks;
}
