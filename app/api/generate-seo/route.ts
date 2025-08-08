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
      model: "gpt-5-nano",
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: "For every topic you receive, analyze the TITLE and CONTENT to identify the main idea, most relevant keywords, and—crucially—the specific tone set by the title and content, especially if it is sassy, cheeky, irreverent, or otherwise distinct. Your output must provide a metaTitle and metaDescription that use language that is clearly and meaningfully different from the supplied TITLE and CONTENT.\n\nYour approach must always:\n- Carefully examine and summarize the core message, subject, user intent, and overall attitude or style from the TITLE and CONTENT.\n- Precisely mirror the tone—if the title and content are sassy or bold, the meta fields must reflect that personality authentically. If the tone is straightforward, match it accordingly.\n- Identify highly relevant, high-traffic keywords a user would likely use to find this topic, using only information from the TITLE and CONTENT.\n\nYou must strictly adhere to these rules:\n- metaTitle and metaDescription **must each be different than both the TITLE and CONTENT supplied (do not copy) while still reflecting the same subject and tone**. Do not use identical phrases or direct rewrites from the input.\n- Maintain the authentic style or attitude shown in the original, without flattening or neutralizing the tone.\n- The keywords array must contain **at least 8 unique keywords** (single words or very short phrases), with **no duplicates**. Include more than 8 if the topic supports it.\n- All meta fields must be based strictly on the tone, wording, and substance of the TITLE and CONTENT provided, but *not repeating them*.\n- No explanations, no markup, and no code block formatting.\n\n# Steps\n\n1. Internally analyze the TITLE and CONTENT to determine main topic, user intent, audience, and explicit tone or attitude (e.g., sassiness).\n2. Identify and select precise, unique, relevant keywords a user would use to find this topic—at least 8, with no duplicates, more if appropriate.\n3. Craft an original, SEO-optimized metaTitle, matching the attitude, sass, or style of the TITLE and CONTENT, but phrased differently from the input.\n4. Compose a compelling metaDescription (max 256 characters), summarizing the value and purpose of the page, clearly distinct from both supplied fields but reflecting the source’s personality.\n5. Present ONLY the JSON object in the required schema.\n\n# Output Format\n\nOutput strictly as a single-line JSON object:\n{\"metaTitle\":\"text\",\"metaDescription\":\"text\",\"keywords\":[\"keyword1\",\"keyword2\",\"keyword3\",\"keyword4\",\"keyword5\",...]}\n- Do not include explanation, markdown, or code blocks.\n- metaTitle and metaDescription must use different language than the TITLE and CONTENT. Do not restate input fields.\n\n# Examples\n\nExample 1  \nInput:  \nTITLE: How to Care for Succulent Plants  \nCONTENT: Succulents require proper sunlight, well-draining soil, and minimal watering. Learn the essential steps to keep your succulents thriving.\n\nInternal Reasoning:  \n- Main topic: Care for succulent plants, targeting beginner gardeners.\n- Tone: Straightforward, practical.\n- Keywords: \"succulent care\", \"succulent plants\", \"plant care\", \"watering succulents\", \"sunlight requirements\", \"indoor plants\", \"easy houseplants\", \"drought tolerant\".\n- metaTitle and metaDescription will be practical and informative but must avoid phrasing found directly in TITLE or CONTENT.\n\nOutput:  \n{\"metaTitle\":\"Master the basics: thriving succulents made simple\",\"metaDescription\":\"Unlock the secrets to vibrant succulents—discover light, soil, and watering tips that set your plants apart. Anyone can keep these beauties alive!\",\"keywords\":[\"succulent care\",\"succulent plants\",\"plant care\",\"watering succulents\",\"sunlight requirements\",\"indoor plants\",\"easy houseplants\",\"drought tolerant\"]}\n\nExample 2  \nInput:  \nTITLE: Stop Killing Your Houseplants: A Sassy Survival Guide  \nCONTENT: Tired of being a serial plant killer? This no-nonsense guide spills the tea on what you’re doing wrong—and how to actually keep your leafy friends alive this time.\n\nInternal Reasoning:  \n- Main topic: Houseplant rescue for users who struggle to keep plants alive.\n- Tone: Sassy, bold, irreverent.\n- Keywords: \"houseplant care\", \"plant survival\", \"beginner gardening\", \"indoor plants\", \"easy houseplants\", \"plant tips\", \"plant rescue\", \"plant maintenance\".\n- metaTitle and metaDescription will match the sassy, cheeky voice but with original wording, not repeated phrases.\n\nOutput:  \n{\"metaTitle\":\"Houseplants fighting back: comedy and cures for black thumbs\",\"metaDescription\":\"Say goodbye to wilted woes—this humor-packed guide tells you how to rescue and revive your plants with a fearless dose of sass and real advice.\",\"keywords\":[\"houseplant care\",\"plant survival\",\"beginner gardening\",\"indoor plants\",\"easy houseplants\",\"plant tips\",\"plant rescue\",\"plant maintenance\"]}\n\n(Note: metaTitle and metaDescription must never use direct or lightly-altered wording from the provided TITLE or CONTENT. Always rephrase and ensure originality, tone-match, and vividness.)\n\n# Notes\n\n- metaTitle and metaDescription must each be materially different from the supplied TITLE and CONTENT—in style, structure, and language.\n- Output must authentically reflect any distinct personality or tone (sass, attitude, energy) from the inputs.\n- Flat, generic, or copied copy (even partial) is unacceptable.\n- keywords: 8 or more unique, highly relevant, and searched-for terms.\n- Only return the required JSON object—no explanations, headings, or code blocks.\n- Internally review for tone, originality, and SEO before outputting JSON.\n\nRemember: Outputs must always use original language and must not copy or lightly revise the given TITLE or CONTENT. Match the source's style and attitude, but use distinctly different wording. Return only the required JSON object."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Blog titled "${topic?.TITLE || ''}". Content is: ${topic?.CONTENT || ''}`
            }
          ]
        }
      ],
      text: {
        format: { type: "text" }
      },
      reasoning: {
        effort: "low"
      },
      tools: [],
      store: true
    });

  // Prefer the SDK's aggregated output_text; fallback to scanning output items
  let outputText = (response as any)?.output_text || "";
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

  let meta = {} as any;
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
