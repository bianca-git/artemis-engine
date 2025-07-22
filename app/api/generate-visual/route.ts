import { NextResponse } from 'next/server';
import { appendToSheet } from '../../../utils/googleSheets';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  let error = null;
  let geminiError = null;
  let sheetData = null;

  try {
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key');

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert AI visual strategist. Based on the theme "${prompt}", generate a list of 5 detailed image descriptions. For each image, provide a descriptive name, a caption plan, target audience, relevant keywords, and the best social media platform. Format the output as a JSON array of objects, where each object has keys: "Image Name", "Caption Plan", "Target Audience", "Keywords", and "Platform".`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 1,
        maxOutputTokens: 2048,
        response_mime_type: "application/json",
      }
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      geminiError = await geminiRes.text();
      throw new Error(`Gemini image description generation failed: ${geminiRes.status} ${geminiRes.statusText} - ${geminiError}`);
    }

    const geminiResult = await geminiRes.json();
    const imageDescriptionsText = geminiResult.candidates[0].content.parts[0].text;
    const imageDescriptions = JSON.parse(imageDescriptionsText);

    if (!Array.isArray(imageDescriptions) || imageDescriptions.length === 0) {
      throw new Error('No image descriptions returned from Gemini');
    }

    const values = imageDescriptions.map(desc => [
      desc["Image Name"],
      desc["Caption Plan"],
      desc["Target Audience"],
      desc["Keywords"],
      desc["Platform"],
      'Draft' // Default status
    ]);

    sheetData = await appendToSheet(values);

  } catch (err: any) {
    error = err?.message || String(err);
    // eslint-disable-next-line no-console
    console.error('Image description generation/upload error:', error);
    if (geminiError) console.error('Gemini error details:', geminiError);
  }

  return NextResponse.json({ success: !error, sheetData, prompt, error, geminiError });
}
