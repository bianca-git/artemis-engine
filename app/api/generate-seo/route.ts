
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { topic } = await request.json();
  // Call OpenAI GPT-4.1 nano for SEO meta and keywords
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-0125-preview',
      messages: [
        { role: 'system', content: 'You are an SEO expert.' },
        { role: 'user', content: `Generate SEO meta description and keywords for: ${topic?.TITLE}.\n\n${topic?.CONTENT}` },
      ],
      max_tokens: 300,
      temperature: 0.5,
    }),
  });
  const result = await openaiRes.json();
  const metaDescription = result.choices?.[0]?.message?.content?.split('Keywords:')[0]?.trim() || '';
  const keywordsRaw = result.choices?.[0]?.message?.content?.split('Keywords:')[1] || '';
  const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(Boolean);
  return NextResponse.json({ metaDescription, keywords });
}
