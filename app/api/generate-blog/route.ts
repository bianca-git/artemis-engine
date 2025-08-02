
import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

// Maximum length for heading detection in blog content
const MAX_HEADING_LENGTH = 80;
// Removed invalid instantiation of openaiClient; use openaiClient directly for API calls.


export async function POST(request: Request) {
  const { topic, stream = false } = await request.json();

  if (stream) {
    return NextResponse.json({ error: 'Streaming blog generation is not implemented.' }, { status: 501 });
  }

  try {
    const response = await openaiClient.responses.create({
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
    
    // Try to parse as JSON first, if it fails, convert plain text to Portable Text
    try {
      portableTextContent = JSON.parse(rawContent);
      // Validate that it's actually an array of Portable Text blocks
      if (!Array.isArray(portableTextContent) || 
          (portableTextContent.length > 0 && !portableTextContent[0]._type)) {
        throw new Error('Invalid Portable Text format');
      }
    } catch (parseError) {
      console.warn('Converting plain text to Portable Text format');
      // Convert plain text to Portable Text using the helper function
      portableTextContent = convertToPortableText(rawContent, topic?.TITLE || "");
    }

    return NextResponse.json({
      content: rawContent, // Keep for backward compatibility
      portableText: portableTextContent
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    
    // Return a fallback response with empty but valid Portable Text structure
    return NextResponse.json({
      content: "",
      portableText: [],
      error: 'Failed to generate blog content. Please try again.'
    });
  }
}


function convertToPortableText(htmlContent: string, title: string) {
  // Clean and split content into lines, filtering empty ones
  const lines = htmlContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const blocks = [];
  
  // Add title block if title is provided and not empty
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
  
  // Convert content lines to paragraphs with proper block structure
  lines.forEach((line, index) => {
    if (line.trim()) {
      let style = 'normal';
      let cleanText = line;
      
      // Detect various heading patterns
      if (line.startsWith('###')) {
        style = 'h3';
        cleanText = line.replace(/^###\s*/, '');
      } else if (line.startsWith('##')) {
        style = 'h2';
        cleanText = line.replace(/^##\s*/, '');
      } else if (line.startsWith('#')) {
        style = 'h1';
        cleanText = line.replace(/^#\s*/, '');
      } else if (line.match(/^[A-Z][^.]*:?\s*$/) && line.length < MAX_HEADING_LENGTH) {
        // Short lines that look like headings (all caps or title case, ending with : or nothing)
        style = 'h2';
      }
      
      blocks.push({
        _type: 'block',
        _key: `block-${index}`,
        style,
        children: [
          {
            _type: 'span',
            _key: `span-${index}`,
            text: cleanText,
            marks: []
          }
        ]
      });
    }
  });
  
  // If no blocks were created, add a default empty block
  if (blocks.length === 0) {
    blocks.push({
      _type: 'block',
      _key: 'empty-block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'empty-span',
          text: 'No content generated. Please try again.',
          marks: []
        }
      ]
    });
  }
  
  return blocks;
}
