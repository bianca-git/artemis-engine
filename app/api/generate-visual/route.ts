import { NextResponse } from 'next/server';
import { hasValidOpenAIKey } from '../../../utils/openaiClient';
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
    const error = err?.message || String(err);
    console.error('Image generation error:', error);

    return NextResponse.json({
      success: false,
      images: [],
      prompt,
      error
    }, { status: 500 });
  }
}
