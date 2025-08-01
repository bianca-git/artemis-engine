import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

export async function POST(request: Request) {
  const { topic } = await request.json();
  
  // Return mock data if no API key (for build/dev)
  const mockContent = `This is a mock blog post about ${topic?.TITLE || 'a topic'}. ${topic?.CONTENT || 'Content will be generated here.'}`;
  const mockResponse = { 
    content: mockContent,
    portableText: convertToPortableText(mockContent, topic?.TITLE || "Sample Title")
  };

  if (!hasValidOpenAIKey()) {
    return NextResponse.json(mockResponse);
  }
  
  try {
    // Call OpenAI with prompt to generate content as Portable Text JSON (stringified)
    const response = await openaiClient.responses.create({
      prompt: {
        id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
        version: "3", 
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
      portableTextContent = convertToPortableText(rawContent, topic?.TITLE || "");
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
            text: line.replace(/^#+\s*|^[A-Z][^.]*:?\s*/, ''), // Remove markdown headers and other heading patterns
            marks: []
          }
        ]
      });
    }
  });
  
  return blocks;
}
