
import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-turbo",
    messages: [
      {
        role: "user",
        content: "Amplify the topic: Microsoft Word"
      }
    ]
  });

  return NextResponse.json(response);
}