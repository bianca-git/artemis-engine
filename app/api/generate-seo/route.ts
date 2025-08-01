import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { topic } = await request.json();
  
  // Skip API call during build
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ 
      content: {
        metaDescription: `Mock SEO description for ${topic?.TITLE || 'topic'}`,
        keywords: ["mock", "seo", "keywords"]
      }
    });
  }
  
  // Call OpenAI GPT-4.1 nano for SEO meta and keywords
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are an SEO expert.' },
        { role: 'system', content: 'Return content in the following format:\n\n{"content":{"metaDescription":"<Description in plain text>","keywords":["<Keyword one>","<Keyword two>"]}}' },
        { role: 'user', content: `Generate SEO meta description and keywords for: ${topic?.TITLE}.\n\n${topic?.CONTENT}` },
      ],
      max_tokens: 1200,
      temperature: 0.5,
    }),
  });
  const result = await openaiRes.json();
  let metaDescription = '';
  let keywords = [];
  try {
    // OpenAI returns a JSON object as string, with "content" property
    const content = result.choices?.[0]?.message?.content || '';
    const outer = JSON.parse(content);
    if (outer.content) {
      metaDescription = outer.content.metaDescription || '';
      keywords = Array.isArray(outer.content.keywords) ? outer.content.keywords : [];
    } else {
      metaDescription = outer.metaDescription || '';
      keywords = Array.isArray(outer.keywords) ? outer.keywords : [];
    }
  } catch (e) {
    // fallback: try to extract manually
    const content = result.choices?.[0]?.message?.content || '';
    metaDescription = content.split('Keywords:')[0]?.trim() || '';
    const keywordsRaw = content.split('Keywords:')[1] || '';
    keywords = keywordsRaw.split(',').map(k => k.trim()).filter(Boolean);
  }
  return NextResponse.json({ metaDescription, keywords });
}
