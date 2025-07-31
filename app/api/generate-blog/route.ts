
import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.responses.create({
  prompt: {
    "id": "pmpt_6886988173e88190932b16937dd6036f0f80c6872a55e615",
    "version": "1"
  }
});

export async function POST(request: Request) {
  const { topic } = await request.json();
  // Call OpenAI GPT-4.1 for blog writing
  const openaiRes = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      assistant_id: "asst_g3uj9k0vKr50t0RTd4I5GZHz",
      messages: [
        { role: 'user', content: `Write a detailed blog post about ${topic?.CONTENT}.` },
      ],
    }),
  });
  const result = await openaiRes.json();
  const content = result.choices?.[0]?.message?.content || '';
  return NextResponse.json({ content });
}
