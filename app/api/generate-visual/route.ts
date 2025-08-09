import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * Visual generation API using Google GenAI (Imagen 4.0 Ultra)
 */
export async function POST(request: Request) {
  const body = await request.json();
  // Support legacy shape { prompt, scene, bodyLanguage } and new shape with location/pose or nested visual object
  const visual = body.visual || {};
  const prompt: string = body.prompt || visual.prompt || '';
  const scene: string = body.scene || body.imageScene || '';
  const bodyLanguage: string = body.bodyLanguage || body.body || '';
  const location: string = body.location || visual.location || '';
  const pose: string = body.pose || visual.pose || '';

  // Input validation
  if (!prompt?.trim()) {
    return NextResponse.json({
      success: false,
      error: 'Missing required parameter: prompt'
    }, { status: 400 });
  }

  // Return mock data if no API key
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      success: true,
      descriptions: [
        {
          "Image Name": "Mock Visual 1",
          "Caption Plan": "Mock caption for visual content",
          "Target Audience": "General audience",
          "Keywords": ["mock", "visual", "content"],
          "Platform": "Instagram",
          size: { width: 2, height: 1 },
          location, pose
        }
      ],
      images: [],
      prompt,
      location,
      pose,
      rawPrompt: { prompt, location, pose },
      size: { width: 2, height: 1 }
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Compose a detailed prompt for the model
    const fullPrompt = [
      `Theme: ${prompt}`,
      location ? `Location: ${location}` : null,
      pose ? `Pose: ${pose}` : null,
      scene ? `Scene: ${scene}` : null,
      bodyLanguage ? `Body Language: ${bodyLanguage}` : null,
      'Generate a visually engaging, cinematic, high-quality image. Maintain a 2:1 aspect ratio.'
    ].filter(Boolean).join('\n');

    const response = await ai.models.generateImages({
      model: 'models/imagen-4.0-ultra-generate-preview-06-06',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '2:1',
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
      location,
      pose,
      rawPrompt: { prompt, location, pose },
      size: { width: 2, height: 1 }
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
        success: true,
        descriptions: [
          {
            "Image Name": "Mock Visual (Invalid API Key)",
            "Caption Plan": "Fallback caption because the provided Google AI API key is invalid.",
            "Target Audience": "General audience",
            "Keywords": ["mock", "visual", "content"],
            "Platform": "Instagram",
            size: { width: 2, height: 1 },
            location, pose
          }
        ],
        images: [],
        prompt,
        location,
        pose,
        rawPrompt: { prompt, location, pose },
        size: { width: 2, height: 1 }
      });
    }

    // Unknown error: return a 500 but keep a consistent response shape
    return NextResponse.json({
      success: false,
      images: [],
      prompt,
      location,
      pose,
      rawPrompt: { prompt, location, pose },
      size: { width: 2, height: 1 },
      error: typeof err?.message === 'string' ? err.message : 'Image generation failed'
    }, { status: 500 });
  }
}
