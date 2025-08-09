import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Static stylistic tags automatically appended to every image generation request
const STATIC_IMAGE_TAGS = [
  'rainbow neon hair',
  'futuristic dress',
  'woman',
  'minimalist lighting',
  'rgb wire lines on arms and legs',
  'circuit board patterns',
  'digital vector art',
  'Guweiz\'s style'
];

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
  // New optional params inspired by provided API usage example
  // Allow aspectRatio override; default now 16:9 (previously hard-coded 2:1)
  let aspectRatio: string = (body.aspectRatio || visual.aspectRatio || '16:9').toString();
  // Normalize aspect ratio (accept e.g. "16x9")
  aspectRatio = aspectRatio.replace('x', ':');
  // Validate basic pattern W:H with positive ints; fall back to 16:9 if invalid
  if (!/^[0-9]+:[0-9]+$/.test(aspectRatio)) {
    aspectRatio = '16:9';
  }
  // Allow caller to request multiple images (guard to small max to control cost)
  let numberOfImages = parseInt(body.numberOfImages || body.count || visual.numberOfImages || '1', 10);
  if (isNaN(numberOfImages) || numberOfImages < 1) numberOfImages = 1;
  if (numberOfImages > 4) numberOfImages = 4; // safety cap

  // Helper to convert aspect ratio to size object similar to previous fixed size
  const [wStr, hStr] = aspectRatio.split(':');
  const size = { width: Number(wStr) || 16, height: Number(hStr) || 9 };

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
          size,
          location, pose,
          aspectRatio
        }
      ],
      images: [],
      prompt,
      location,
      pose,
      rawPrompt: { prompt, location, pose },
      size,
      aspectRatio,
      numberOfImages
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Compose a detailed prompt for the model
    // De-duplicate static tags already present in the user prompt
    const lowerPrompt = prompt.toLowerCase();
    const appliedTags = STATIC_IMAGE_TAGS.filter(tag => !lowerPrompt.includes(tag.toLowerCase()));
    const fullPrompt = [
      `Prompt: ${prompt}`,
      location ? `Location: ${location}` : null,
      pose ? `Pose: ${pose}` : null,
      scene ? `Scene: ${scene}` : null,
      bodyLanguage ? `Body Language: ${bodyLanguage}` : null,
      appliedTags.length ? `Style Tags: ${appliedTags.join(', ')}` : null,
      'Generate a visually engaging, cinematic, high-quality image. Maintain a 2:1 aspect ratio.'
    ].filter(Boolean).join('\n');

  const modelId = process.env.GEMINI_IMAGE_MODEL || 'models/imagen-4.0-ultra-generate-preview-06-06';
  let response;
    try {
      response = await ai.models.generateImages({
        model: modelId,
        prompt: fullPrompt,
        config: {
      numberOfImages,
      outputMimeType: 'image/jpeg',
      aspectRatio, // Now dynamic (sample used 16:9)
        },
      });
    } catch (callErr: any) {
      // If the underlying SDK throws a 400 (bad request / unsupported params) provide a soft fallback
      const status = callErr?.status || callErr?.code;
      const name = callErr?.name || 'UnknownError';
      const message = callErr?.message || String(callErr);
      console.error('Imagen API call error', { status, name, message });
      if (status === 400) {
    return NextResponse.json({
          success: true,
          descriptions: [
            {
              "Image Name": "Mock Visual (400 Fallback)",
              "Caption Plan": "Fallback because the image generation request was invalid or unsupported.",
              "Target Audience": "General audience",
              "Keywords": ["mock", "visual", "fallback"],
              "Platform": "Instagram",
        size,
        location, pose,
        aspectRatio
            }
          ],
          images: [],
          prompt,
          location,
          pose,
      rawPrompt: { prompt, location, pose },
      size,
      aspectRatio,
      numberOfImages,
          warning: 'Image API returned 400. Provided mock data instead.'
        });
      }
      throw callErr; // Let the outer catch classify other errors
    }

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
      rawPrompt: { prompt, location, pose, staticTags: STATIC_IMAGE_TAGS, aspectRatio },
      size,
      aspectRatio,
      numberOfImages
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
      size,
      location, pose,
      aspectRatio
          }
        ],
        images: [],
        prompt,
        location,
        pose,
    rawPrompt: { prompt, location, pose },
    size,
    aspectRatio,
    numberOfImages
      });
    }

    // Unknown error: return a 500 but keep a consistent response shape & embed diagnostic hint
    return NextResponse.json({
      success: false,
      images: [],
      prompt,
      location,
      pose,
      rawPrompt: { prompt, location, pose, aspectRatio },
      size,
      aspectRatio,
      numberOfImages,
      error: typeof err?.message === 'string' ? err.message : 'Image generation failed',
      hint: 'Check model id (GEMINI_IMAGE_MODEL), aspectRatio, and API key permissions.'
    }, { status: 500 });
  }
}
