

import { NextResponse } from 'next/server';
import client from '../publish-cms/sanityClient';

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
  let assetRef = '';

  // Upload image to Sanity immediately
  if (url) {
    try {
      const imageRes = await fetch(url);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const asset = await client.assets.upload('image', buffer, {
        filename: 'generated-image.jpg',
      });
      assetRef = asset._id;
    } catch (err) {
      assetRef = '';
    }
  }

  return NextResponse.json({ url, assetRef, prompt });
}
