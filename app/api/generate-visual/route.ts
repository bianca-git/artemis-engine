import { NextResponse } from 'next/server';

// Route implemented to mirror the provided curl (predict endpoint) using direct HTTP call.
// Uses environment variable GEMINI_API_KEY (no hard-coded keys).

interface PredictResponseImagePrediction {
  bytesBase64Encoded?: string;
  mimeType?: string;
}
interface PredictResponse {
  predictions?: PredictResponseImagePrediction[];
  error?: { message?: string; code?: number };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  console.debug('[generate-visual] Incoming body:', body);

  const visual = body.visual || {};
  const hasPassThrough = Array.isArray(body.instances) && body.instances.length > 0 && body.parameters;
  

  // Initialize variables (will be reassigned depending on pass-through vs legacy shape)
  let prompt: string = '';
  let aspectRatio: string = '16:9';
  let sampleCount: number = 1;
  let outputMimeType: string = 'image/png';
  let personGeneration: string = 'ALLOW_ADULT';

 // Static prefix always added before dynamic portion of prompt
  const STATIC_PROMPT_PREFIX = 'Featuring the Digital Diva: A green eyed, sassy brunette with rainbow streaks in her hair. Neon Futuristic Vector Anime Style: ';
  
  if (hasPassThrough) {
    // Extract strictly from provided shape
    const incomingPrompt = body.instances?.[0]?.prompt || '';
    prompt = incomingPrompt;
    if (body.parameters?.aspectRatio) aspectRatio = String(body.parameters.aspectRatio).replace('x', ':');
    if (body.parameters?.sampleCount != null) sampleCount = parseInt(String(body.parameters.sampleCount), 10) || 1;
    if (body.parameters?.outputMimeType) outputMimeType = String(body.parameters.outputMimeType);
    if (body.parameters?.personGeneration) personGeneration = String(body.parameters.personGeneration);
  console.debug('[generate-visual] Pass-through shape detected. Extracted values:', { prompt, aspectRatio, sampleCount, outputMimeType, personGeneration });
  } else {
    // Legacy / simplified input shape (ensure proper grouping with parentheses to avoid precedence issues)
    const dynamicPart = body.prompt || visual.prompt || body.text || '';
    prompt = dynamicPart;
    aspectRatio = (body.aspectRatio || visual.aspectRatio || '16:9').toString().replace('x', ':');
    sampleCount = parseInt(body.sampleCount || body.numberOfImages || visual.sampleCount || '1', 10);
    outputMimeType = (body.outputMimeType || body.mimeType || 'image/png').toString();
    personGeneration = (body.personGeneration || 'ALLOW_ADULT') as string;
  console.debug('[generate-visual] Legacy shape detected. Extracted values:', { prompt, aspectRatio, sampleCount, outputMimeType, personGeneration });
  }

  // Normalization / validation
  if (!/^[0-9]+:[0-9]+$/.test(aspectRatio)) aspectRatio = '16:9';
  if (isNaN(sampleCount) || sampleCount < 1) sampleCount = 1;
  if (sampleCount > 4) sampleCount = 4; // safety cap

  // Enforce prefix (only once)
  if (prompt && !prompt.startsWith(STATIC_PROMPT_PREFIX)) {
    prompt = STATIC_PROMPT_PREFIX + prompt;
  }
  console.debug('[generate-visual] Normalized & prefixed values:', { prompt, aspectRatio, sampleCount, outputMimeType, personGeneration });
 

  if (!prompt.trim()) {
  return NextResponse.json({ success: false, error: 'Missing required parameter: prompt', effectivePrompt: prompt }, { status: 400 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
  console.debug('[generate-visual] No GEMINI_API_KEY present. Returning mock response.');
    return NextResponse.json({
      success: true,
      images: [],
      prompt,
      aspectRatio,
      sampleCount,
      outputMimeType,
      personGeneration,
      mock: true,
      note: 'No GEMINI_API_KEY set. Returning mock response.'
  ,effectivePrompt: prompt
    });
  }

  const urlModel = 'imagen-4.0-ultra-generate-preview-06-06';
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${urlModel}:predict?key=${key}`;

  // Build payload EXACTLY as specified (no extra keys, fixed structure & key order)
  // EXACT payload shape required by user. We build a deterministic JSON string to avoid
  // any accidental extra fields or key reordering.
  // If the caller already supplied the exact payload shape, forward it untouched (except aspect ratio normalization above)
  const predictBodyObject = {
    instances: [{ prompt }],
    parameters: {
      outputMimeType,
      sampleCount,
      personGeneration,
      aspectRatio
    }
  } as const;
  const predictBodyJson = JSON.stringify(predictBodyObject);
  console.debug('[generate-visual] Outbound payload JSON:', predictBodyJson);
  // (For safety we could JSON.parse to ensure it's valid, but we rely on controlled construction.)

  try {
    const fetchRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: predictBodyJson
    });
  console.debug('[generate-visual] Fetch response status:', fetchRes.status);

    const json = await fetchRes.json() as PredictResponse;
  console.debug('[generate-visual] Raw API JSON keys:', Object.keys(json || {}));

    if (!fetchRes.ok || json.error) {
      const message = json.error?.message || `Predict request failed (${fetchRes.status})`;
      const code = json.error?.code || fetchRes.status;
      if (code === 400 || code === 401 || code === 403) {
  console.debug('[generate-visual] Soft fallback due to API error:', { code, message });
        return NextResponse.json({
          success: true,
          images: [],
          prompt,
          aspectRatio,
          sampleCount,
          outputMimeType,
          personGeneration,
          warning: `Image API fallback due to error: ${message}`,
          effectivePrompt: prompt
        });
      }
      return NextResponse.json({
        success: false,
        error: message,
        prompt,
        aspectRatio,
        sampleCount,
        outputMimeType,
        personGeneration,
        effectivePrompt: prompt
      }, { status: code || 500 });
    }

    const predictions = json.predictions || [];
    const images = predictions
      .map(p => p.bytesBase64Encoded ? `data:${p.mimeType || outputMimeType};base64,${p.bytesBase64Encoded}` : null)
      .filter(Boolean);

    if (!images.length) {
  console.debug('[generate-visual] No images returned in predictions.');
      return NextResponse.json({
        success: false,
        error: 'No images in prediction response',
        prompt,
        aspectRatio,
        sampleCount,
        outputMimeType,
  personGeneration,
  effectivePrompt: prompt
      }, { status: 502 });
    }

    const debug = body.debug || body._debug;
    return NextResponse.json({
      success: true,
      images,
      prompt,
      aspectRatio,
      sampleCount,
      outputMimeType,
  personGeneration,
  effectivePrompt: prompt,
      ...(debug ? { outboundPayload: predictBodyObject } : {})
    });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Unexpected error performing predict';
  console.debug('[generate-visual] Catch block triggered:', message);
    const debug = body.debug || body._debug;
    return NextResponse.json({
      success: true,
      images: [],
      prompt,
      aspectRatio,
      sampleCount,
      outputMimeType,
      personGeneration,
      warning: message,
      mock: true,
  effectivePrompt: prompt,
      ...(debug ? { outboundPayload: predictBodyObject } : {})
    });
  }
}
