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
    // Gemini API endpoint and key (replace with your actual Gemini endpoint and key)
    const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key');

    // Gemini payload (prompt engineering similar to previous logic)
    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert AI visual designer. Create a high-resolution marketing visual in a modern, vibrant style. Theme: ${prompt}. Use magenta and cyan accents, clean lines, and a futuristic look. Output as a photorealistic image suitable for web and social media. Do not include any text in the image.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 1,
        topP: 1,
        maxOutputTokens: 2048
      }
    };

    // Call Gemini for image generation
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });
    if (!geminiRes.ok) {
      geminiError = await geminiRes.text();
      throw new Error(`Gemini image generation failed: ${geminiRes.status} ${geminiRes.statusText} - ${geminiError}`);
    }
    const geminiResult = await geminiRes.json();
    // Extract base64 image from Gemini response (assume image is in geminiResult.candidates[0].content.parts[0].inlineData.data)
    const base64Image = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    if (!base64Image) {
      throw new Error('No image data returned from Gemini');
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
