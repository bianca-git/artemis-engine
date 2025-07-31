

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
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
