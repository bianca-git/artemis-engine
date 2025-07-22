import { NextResponse } from 'next/server';
import client from '../publish-cms/sanityClient';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  // Gemini image generation integration
  let url = '';
  let assetRef = '';
  let error = null;
  let geminiError = null;
  let imageFetchError = null;
  let uploadError = null;

  try {
    // Gemini API endpoint and key
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key');

    // Gemini payload for generating a descriptive prompt for the image model
    const promptGenerationPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert AI visual designer. Create a detailed, descriptive prompt for an image generation model. The prompt should describe a high-resolution marketing visual in a modern, vibrant style. Theme: ${prompt}. Use magenta and cyan accents, clean lines, and a futuristic look. The final output should be a photorealistic image suitable for web and social media, with no text. The prompt you generate should be detailed enough for an image model to create a compelling visual based on it.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 1,
        maxOutputTokens: 1024
      }
    };

    // Call Gemini to generate the image prompt
    const promptRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptGenerationPayload),
    });

    if (!promptRes.ok) {
      geminiError = await promptRes.text();
      throw new Error(`Gemini prompt generation failed: ${promptRes.status} ${promptRes.statusText} - ${geminiError}`);
    }

    const promptResult = await promptRes.json();
    const imagePrompt = promptResult.candidates[0].content.parts[0].text;

    // Use a different service for image generation, e.g. DALL-E via OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key');

    const dallePayload = {
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    };

    const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(dallePayload)
    });

    if (!dalleRes.ok) {
      const errorText = await dalleRes.text();
      throw new Error(`DALL-E image generation failed: ${dalleRes.status} ${dalleRes.statusText} - ${errorText}`);
    }

    const dalleResult = await dalleRes.json();
    const base64Image = dalleResult.data[0].b64_json;

    if (!base64Image) {
      throw new Error('No image data returned from DALL-E');
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');

    // Upload image to Sanity
    try {
      const asset = await client.assets.upload('image', buffer, {
        filename: 'generated-image-gemini.jpg',
      });
      assetRef = asset._id;
      // Optionally, you can set a public URL if Sanity provides one
      url = asset.url || '';
    } catch (uploadErr: any) {
      uploadError = uploadErr?.message || String(uploadErr);
      throw new Error(`Sanity image upload failed: ${uploadError}`);
    }
  } catch (err: any) {
    error = err?.message || String(err);
    url = '';
    assetRef = '';
    // eslint-disable-next-line no-console
    console.error('Image generation/upload error:', error);
    if (geminiError) console.error('Gemini error details:', geminiError);
    if (imageFetchError) console.error('Image fetch error details:', imageFetchError);
    if (uploadError) console.error('Sanity upload error details:', uploadError);
  }

  return NextResponse.json({ url, assetRef, prompt, error, geminiError, imageFetchError, uploadError });
}
