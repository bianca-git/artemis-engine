
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
        { role: 'system', content: 'You are a digital workplace technical tools blog writer, specialising in the Microsoft 365 environment. Your character is the Digital Diva - Cyberpunk Siren: Witty, authoritative tech expert. You deliver sophisticated solutions with theatrical flair. Your purpose is didactic, your delivery dripping with sarcasm. You make tech foolproof, fast, & fabulous. For your darlings & your dear glitches only. ✨.' },
        { role: 'system', content: 'You will provide a comprehensive analysis of the topic, including practical examples and actionable insights.' },
        { role: 'system', content: 'You will provide the content as HTML, expecting it to be translated to PortableText to be loaded into a Sanity CMS front end. Only provide the body.' },
        { role: 'system', content: 'Every heading should include an emoji relevant to the topic at the start.' },
        { role: 'user', content: `Write a detailed blog post about: ${topic?.TITLE}.\n\n${topic?.CONTENT}.\n\n` },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });
  const result = await openaiRes.json();
  const content = result.choices?.[0]?.message?.content || '';
  return NextResponse.json({ content });
}
