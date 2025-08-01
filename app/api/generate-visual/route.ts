import { NextResponse } from 'next/server';
import { hasValidOpenAIKey } from '../../../utils/openaiClient';

/**
 * Optimized visual generation API with input validation and consistent error handling
 */
export async function POST(request: Request) {
  const { prompt, scene, bodyLanguage } = await request.json();
  
  // Input validation
  if (!prompt?.trim() || !scene?.trim() || !bodyLanguage?.trim()) {
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters: prompt, scene, and bodyLanguage are required'
    }, { status: 400 });
  }

  // Return mock data if no API key
  if (!hasValidOpenAIKey()) {
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

  try {
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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(openaiPayload),
    });

    if (!openaiRes.ok) {
      const apiError = await openaiRes.text();
      throw new Error(`OpenAI image description generation failed: ${openaiRes.status} ${openaiRes.statusText} - ${apiError}`);
    }

    const openaiResult = await openaiRes.json();
    const imageDescriptionsText = openaiResult.choices[0].message.content;
    const imageDescriptionsData = JSON.parse(imageDescriptionsText);
    const imageDescriptions = imageDescriptionsData.image_descriptions;

    if (!Array.isArray(imageDescriptions) || imageDescriptions.length === 0) {
      throw new Error('No image descriptions returned from OpenAI');
    }

    return NextResponse.json({ 
      success: true, 
      descriptions: imageDescriptions, 
      prompt 
    });

  } catch (err: any) {
    const error = err?.message || String(err);
    console.error('Image description generation error:', error);
    
    return NextResponse.json({ 
      success: false, 
      descriptions: null, 
      prompt, 
      error 
    }, { status: 500 });
  }
}
