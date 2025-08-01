

import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await openai.responses.create({
      prompt: {
        "id": "pmpt_6886988173e88190932b16937dd6036f0f80c6872a55e615",
        "version": "6",
        "variables": {
          "keyword": `${body.keyword}`
        }
      }
    });
    console.log(response.output_text);

    return NextResponse.json({ output_text: response.output_text });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
