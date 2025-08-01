
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { blog } = await request.json();
  
  // Skip API call during build
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ 
      posts: {
        linkedin: "Mock LinkedIn post content",
        twitter: "Mock Twitter post content", 
        instagram: "Mock Instagram post content"
      }
    });
  }
  
  // Call OpenAI GPT-4.1 nano for social post generation
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-0125-preview',
      messages: [
        { role: 'system', content: 'You are a social media copywriter.' },
        { role: 'user', content: `Write LinkedIn, Twitter, and Instagram posts for this blog:\n\n${blog}` },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });
  const result = await openaiRes.json();
  const content = result.choices?.[0]?.message?.content || '';
  // Simple parsing for demo: expects output in format "LinkedIn: ... Twitter: ... Instagram: ..."
  const linkedin = content.match(/LinkedIn:(.*?)(Twitter:|Instagram:|$)/s)?.[1]?.trim() || '';
  const twitter = content.match(/Twitter:(.*?)(LinkedIn:|Instagram:|$)/s)?.[1]?.trim() || '';
  const instagram = content.match(/Instagram:(.*?)(LinkedIn:|Twitter:|$)/s)?.[1]?.trim() || '';
  return NextResponse.json({ posts: { linkedin, twitter, instagram } });
}
