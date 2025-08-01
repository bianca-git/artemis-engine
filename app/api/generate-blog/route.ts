

import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { topic } = await request.json();
  // Call OpenAI with prompt variables for title and content
  const response = await openai.responses.create({
    prompt: {
      id: "pmpt_688c4b3c1da88190bae98b455780bb1205afd50968eca7c0",
      version: "1",
      variables: {
        title: topic?.TITLE || "",
        content: topic?.CONTENT || ""
      }
    }
  });
  // Use output_text as the blog content, matching amplify-topic route
  const content = response?.output_text || "";
  return NextResponse.json({ content });
}
