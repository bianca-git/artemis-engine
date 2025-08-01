
import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

export async function POST(request: Request) {
  const { topic } = await request.json();
  
  // Skip API call during build - return mock streaming response
  if (!process.env.OPENAI_API_KEY) {
    const mockContent = `This is a mock blog post about ${topic?.TITLE || 'a topic'}. ${topic?.CONTENT || 'Content will be generated here.'}`;
    
    // Create a streaming response for mock data
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate streaming by sending chunks
        const words = mockContent.split(' ');
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk, isComplete: false })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        }
        
        // Send completion event with portable text
        const portableText = convertToPortableText(mockContent, topic?.TITLE || "Sample Title");
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          content: '', 
          isComplete: true, 
          portableText,
          fullContent: mockContent 
        })}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
  
  // Create streaming response for OpenAI
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Call OpenAI with streaming enabled
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional blog writer. Write a comprehensive, engaging blog post based on the provided topic and content."
            },
            {
              role: "user",
              content: `Title: ${topic?.TITLE || ""}\nContent: ${topic?.CONTENT || ""}\n\nPlease write a detailed blog post about this topic.`
            }
          ],
          stream: true,
          max_tokens: 2000,
          temperature: 0.7,
        });

        let fullContent = '';
        
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            // Send each chunk as it arrives
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content, isComplete: false })}\n\n`));
          }
        }
        
        // Send completion event with portable text
        const portableText = convertToPortableText(fullContent, topic?.TITLE || "");
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          content: '', 
          isComplete: true, 
          portableText,
          fullContent 
        })}\n\n`));
        
      } catch (error) {
        console.error('Streaming error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          error: 'Failed to generate content', 
          isComplete: true 
        })}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
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
