import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

export async function POST(request: Request) {
  const { topic, stream = false } = await request.json();
  
  // Return mock data if no API key (for build/dev)
  const mockContent = `# ${topic?.TITLE || 'Sample Title'}

${topic?.CONTENT || 'Content will be generated here.'}

## Introduction

This is a mock blog post about ${topic?.TITLE || topic?.CONTENT || 'a topic'}. The content generation system allows for both immediate and streaming responses.

## Key Points

- Point one: Important information about the topic
- Point two: Additional insights and details
- Point three: Practical applications and examples

## Conclusion

In conclusion, this demonstrates the streaming blog generation capability of the Artemis Engine system.`;

  const title = topic?.TITLE?.trim() || topic?.CONTENT?.trim() || "Sample Title";
  const mockResponse = { 
    content: mockContent,
    portableText: convertToPortableText(mockContent, title)
  };

  // If streaming is requested, return streaming response
  if (stream) {
    return handleStreamingResponse(mockContent, !hasValidOpenAIKey());
  }

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

// Handle streaming response
const MOCK_CHUNK_DELAY_MS = 80; // ms delay between chunks for mock streaming
const REAL_CHUNK_DELAY_MS = 30; // ms delay between chunks for real streaming

function handleStreamingResponse(content: string, isMock: boolean) {
  const encoder = new TextEncoder();
  
  const customReadable = new ReadableStream({
    start(controller) {
      // Simulate streaming by sending content in chunks
      const words = content.split(' ');
      let currentContent = '';
      let wordIndex = 0;
      
      function sendNextChunk() {
        if (wordIndex >= words.length) {
          // Send final completion event
          const finalData = {
            type: 'complete',
            content: currentContent,
            portableText: convertToPortableText(currentContent, ''),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
          controller.close();
          return;
        }
        
        // Add next word(s) - send multiple words for faster streaming in demo
        const wordsToAdd = isMock ? Math.min(3, words.length - wordIndex) : 1;
        for (let i = 0; i < wordsToAdd && wordIndex < words.length; i++) {
          currentContent += (currentContent ? ' ' : '') + words[wordIndex];
          wordIndex++;
        }
        
        // Send current state
        const data = {
          type: 'chunk',
          content: currentContent,
          portableText: convertToPortableText(currentContent, ''),
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        
        // Schedule next chunk
        setTimeout(sendNextChunk, isMock ? MOCK_CHUNK_DELAY_MS : REAL_CHUNK_DELAY_MS);
      }
      
      // Start streaming
      sendNextChunk();
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
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
