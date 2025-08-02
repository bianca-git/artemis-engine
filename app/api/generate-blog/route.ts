
import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

// Maximum length for heading detection in blog content
const MAX_HEADING_LENGTH = 80;

export async function POST(request: Request) {
  const { topic } = await request.json();
  
  // Return mock data if no API key (for build/dev)
  const mockContent = `This is a mock blog post about ${topic?.TITLE || topic?.CONTENT || 'a topic'}. ${topic?.CONTENT || 'Content will be generated here.'}`;
  const title = topic?.TITLE?.trim() || topic?.CONTENT?.trim() || "Sample Title";
  const mockResponse = { 
    content: mockContent,
    portableText: convertToPortableText(mockContent, title)
  };

  if (!hasValidOpenAIKey()) {
    return NextResponse.json(mockResponse);
  }
  
  try {
    // Call OpenAI with prompt to generate content as Portable Text JSON (stringified)
    const response = await openaiClient.responses.create({
      prompt: {
        id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
        version: "6", 
        variables: {
          title: topic?.TITLE || "",
          content: topic?.CONTENT || ""
        }
      }
    });

    // Parse the stringified Portable Text JSON array from output_text
    let portableTextContent: any[] = [];
    let rawContent = response?.output_text || "";
    try {
      portableTextContent = JSON.parse(rawContent);
    } catch (err) {
      // fallback: treat as plain text if parsing fails
      const title = topic?.TITLE?.trim() || topic?.CONTENT?.trim() || "Blog Post";
      portableTextContent = convertToPortableText(rawContent, title);
    }
    
    return NextResponse.json({ 
      content: rawContent, // Keep for backward compatibility
      portableText: portableTextContent
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json(mockResponse);
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
