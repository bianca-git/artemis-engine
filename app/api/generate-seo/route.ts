import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

/**
 * API route for generating SEO meta fields using OpenAI.
 * Returns: { metaTitle, metaDescription, keywords[] }
 */
export async function POST(request: Request) {
  const { topic } = await request.json();

  // Return mock data if no API key (for build/dev)
  const mockResponse = {
    metaTitle: `Mock SEO title for ${topic?.TITLE || 'topic'}`,
    metaDescription: `Mock SEO description for ${topic?.TITLE || 'topic'}`,
    keywords: ["mock", "seo", "keywords", "example", "test"]
  };

  if (!hasValidOpenAIKey()) {
    return NextResponse.json(mockResponse);
  }

  try {
    const response = await openaiClient.responses.create({
      prompt: {
        id: "pmpt_688cc889a0808190802bdc23118cab6e0ee933fb76a4e8dd",
        version: "2",
        variables: {
          title: topic?.TITLE || "",
          content: topic?.CONTENT || ""
        }
      }
    });

    // Find the first output item of type "message" and extract output_text
    let outputText = "";
    if (Array.isArray(response.output)) {
      for (const item of response.output) {
        // Some OpenAI SDKs use "content" array, but types may not reflect this.
        // Safely check for content array and extract output_text.
        const contentArr = (item as any)?.content;
        if (Array.isArray(contentArr)) {
          const textObj = contentArr.find((c: any) => c.type === "output_text" && typeof c.text === "string");
          if (textObj) {
            outputText = textObj.text;
            break;
          }
        }
      }
    }

    let meta = {};
    try {
      meta = outputText ? JSON.parse(outputText) : {};
    } catch {
      meta = {
        metaTitle: "",
        metaDescription: "",
        keywords: []
      };
    }

    return NextResponse.json(meta);
  } catch (e) {
    console.error('SEO generation error:', e);
    return NextResponse.json({
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      error: "Failed to generate SEO content"
    }, { status: 500 });
  }
}
