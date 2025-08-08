import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * Visual generation API using Google GenAI (Imagen 4.0 Ultra)
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
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      descriptions: [
        {
          "Image Name": "Mock Visual 1",
          "Caption Plan": "Mock caption for visual content",
          "Target Audience": "General audience",
          "Keywords": ["mock", "visual", "content"],
          "Platform": "Instagram"
        }
      ],
      images: []
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Compose a detailed prompt for the model
    const fullPrompt = `Theme: ${prompt}\nScene: ${scene}\nBody Language: ${bodyLanguage}\nGenerate a visually engaging image for social media.`;

    const response = await ai.models.generateImages({
      model: 'models/imagen-4.0-ultra-generate-preview-06-06',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (!response?.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated.');
    }

    // Return base64-encoded images in the response
    const images = response.generatedImages.map(img =>
      img?.image?.imageBytes ? `data:image/jpeg;base64,${img.image.imageBytes}` : null
    ).filter(Boolean);

    return NextResponse.json({
      success: true,
      images,
      prompt,
    });

  } catch (err: any) {
    // Try to detect invalid API key and fall back to mock descriptions (avoid hard 500s in dev)
    const serialized = typeof err === 'string' ? err : (() => {
      try { return JSON.stringify(err); } catch { return String(err); }
    })();
    const isInvalidKey = serialized.includes('API_KEY_INVALID') || serialized.includes('API key not valid');

    console.error('Image generation error:', serialized);

    if (isInvalidKey) {
      // Provide mock data to keep the UI flow working even with a bad key
      return NextResponse.json({
        descriptions: [
          {
            "Image Name": "Mock Visual (Invalid API Key)",
            "Caption Plan": "Fallback caption because the provided Google AI API key is invalid.",
            "Target Audience": "General audience",
            "Keywords": ["mock", "visual", "content"],
            "Platform": "Instagram"
          }
        ],
        images: [],
        prompt
      });
    }

    // Unknown error: return a 500 but keep a consistent response shape
    return NextResponse.json({
      success: false,
      images: [],
      prompt,
      error: typeof err?.message === 'string' ? err.message : 'Image generation failed'
    }, { status: 500 });
  }
}
