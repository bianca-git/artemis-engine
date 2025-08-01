import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt, scene, bodyLanguage } = await request.json();
  let error = null;
  let apiError = null;
  let imageDescriptions = null;

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      // Return mock data during build
      return NextResponse.json({
        descriptions: [
          {
            "Image Name": "Mock Visual 1",
            "Caption Plan": "Mock caption for visual content",
            "Target Audience": "General audience",
            "Keywords": ["mock", "visual", "content"],
            "Platform": "Instagram"
          }
        ]
      });
    }

    const openaiPayload = {
      model: "gpt-4-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert AI visual strategist. Your task is to generate a list of 5 detailed image descriptions based on a theme, a scene, and body language. For each image, provide a descriptive name, a caption plan, target audience, relevant keywords, and the best social media platform. The output should be a JSON object with a single key "image_descriptions" which contains an array of these 5 objects. Each object in the array must have the following keys: "Image Name", "Caption Plan", "Target Audience", "Keywords", and "Platform".`
        },
        {
          role: "user",
          content: `Generate the image descriptions for the theme: "${prompt}", with the scene: "${scene}", and body language: "${bodyLanguage}"`
        }
      ],
      temperature: 0.8,
      max_tokens: 2048,
      top_p: 1,
    };

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(openaiPayload),
    });

    if (!openaiRes.ok) {
      apiError = await openaiRes.text();
      throw new Error(`OpenAI image description generation failed: ${openaiRes.status} ${openaiRes.statusText} - ${apiError}`);
    }

    const openaiResult = await openaiRes.json();
    const imageDescriptionsText = openaiResult.choices[0].message.content;
    const imageDescriptionsData = JSON.parse(imageDescriptionsText);
    imageDescriptions = imageDescriptionsData.image_descriptions;

    if (!Array.isArray(imageDescriptions) || imageDescriptions.length === 0) {
      throw new Error('No image descriptions returned from OpenAI');
    }

  } catch (err: any) {
    error = err?.message || String(err);
    // eslint-disable-next-line no-console
    console.error('Image description generation error:', error);
    if (apiError) console.error('OpenAI error details:', apiError);
  }

  return NextResponse.json({ success: !error, descriptions: imageDescriptions, prompt, error, apiError });
}
