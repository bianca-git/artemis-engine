
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  // Call OpenAI DALL·E (GPT-4.1) for image generation
  const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x768',
    }),
  });
  const result = await openaiRes.json();
  const url = result.data?.[0]?.url || '';
  const assetRef = result.data?.[0]?.id || '';
  return NextResponse.json({ url, assetRef, prompt });
}
