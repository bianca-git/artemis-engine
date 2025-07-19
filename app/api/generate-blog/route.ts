
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { topic } = await request.json();
  // Call OpenAI GPT-4.1 for blog writing
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-1106-preview',
      messages: [
        { role: 'system', content: 'You are a marketing blog writer.' },
        { role: 'user', content: `Write a detailed blog post about: ${topic?.TITLE}.\n\n${topic?.CONTENT}` },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });
  const result = await openaiRes.json();
  const content = result.choices?.[0]?.message?.content || '';
  return NextResponse.json({ content });
}
