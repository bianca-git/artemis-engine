
import { NextResponse } from 'next/server';
import { hasValidOpenAIKey } from '../../../utils/openaiClient';

/**
 * Optimized social media post generation API with input validation
 */
export async function POST(request: Request) {
  const { blog } = await request.json();
  
  // Input validation
  if (!blog?.trim()) {
    return NextResponse.json({
      error: 'Blog content is required'
    }, { status: 400 });
  }

  // Return mock data if no API key
  const mockResponse = { 
    posts: {
      linkedin: "Mock LinkedIn post content based on your blog",
      twitter: "Mock Twitter post content #blog #content", 
      instagram: "Mock Instagram post content 📝✨ #blogging"
    }
  };

  if (!hasValidOpenAIKey()) {
    return NextResponse.json(mockResponse);
  }
  
  try {
    // Call OpenAI for social post generation with improved prompt
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-0125-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are a social media copywriter. Create platform-specific posts that are engaging and use appropriate hashtags. Format your response as: LinkedIn: [content] Twitter: [content] Instagram: [content]' 
          },
          { 
            role: 'user', 
            content: `Create LinkedIn, Twitter, and Instagram posts for this blog content (keep Twitter under 280 chars):\n\n${blog.substring(0, 2000)}` // Limit input size
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      throw new Error(`OpenAI API error: ${openaiRes.status}`);
    }

    const result = await openaiRes.json();
    const content = result.choices?.[0]?.message?.content || '';
    
    // Enhanced parsing with fallbacks
    const linkedin = content.match(/LinkedIn:\s*(.*?)(?=Twitter:|Instagram:|$)/s)?.[1]?.trim() || 'Professional post based on your blog content.';
    const twitter = content.match(/Twitter:\s*(.*?)(?=LinkedIn:|Instagram:|$)/s)?.[1]?.trim() || 'Check out this blog post! #content';
    const instagram = content.match(/Instagram:\s*(.*?)(?=LinkedIn:|Twitter:|$)/s)?.[1]?.trim() || 'New blog post is live! 📝✨ #blogging';
    
    return NextResponse.json({ 
      posts: { linkedin, twitter, instagram } 
    });
    
  } catch (error) {
    console.error('Social media generation error:', error);
    return NextResponse.json(mockResponse); // Return mock data on error
  }
}
