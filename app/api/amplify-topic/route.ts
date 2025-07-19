
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { keyword } = await request.json();
  // Call OpenAI GPT-4.1 nano for topic amplification
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-0125-preview',
      messages: [
        { role: 'system', content: 'You are a marketing ideation assistant.' },
        { role: 'user', content: `Brainstorm 2 unique blog topic ideas for: ${keyword}. Return each with ID, TITLE, CONTENT, VISUAL.` },
      ],
      max_tokens: 300,
      temperature: 0.8,
    }),
  });
  const result = await openaiRes.json();
  // Expecting output as JSON array or parseable text
  let ideas = [];
  try {
    ideas = JSON.parse(result.choices?.[0]?.message?.content || '[]');
  } catch {
    // fallback: try to parse manually
    ideas = [];
  }
  return NextResponse.json({ ideas });
}
