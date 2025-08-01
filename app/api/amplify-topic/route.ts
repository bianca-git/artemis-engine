

import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

/**
 * Optimized topic amplification API with input validation and error handling
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Input validation
    if (!body.keyword?.trim()) {
      return NextResponse.json({
        error: 'Keyword is required'
      }, { status: 400 });
    }

    const keyword = body.keyword.trim();
    
    // Return mock data if no API key
    const mockResponse = { 
      ideas: `Mock ideas for keyword: ${keyword}. Here are some creative topic suggestions based on your keyword.` 
    };

    if (!hasValidOpenAIKey()) {
      return NextResponse.json(mockResponse);
    }
    
    try {
      const response = await openaiClient.responses.create({
        prompt: {
          "id": "pmpt_6886988173e88190932b16937dd6036f0f80c6872a55e615",
          "version": "6",
          "variables": {
            "keyword": keyword
          }
        }
      });
      
      console.log("Amplify response returned in route.ts");
      
      return NextResponse.json({ 
        ideas: response.output_text || mockResponse.ideas 
      });
      
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(mockResponse); // Return mock data on OpenAI error
    }
    
  } catch (error) {
    console.error('Topic amplification error:', error);
    return NextResponse.json({ 
      error: 'Invalid request format' 
    }, { status: 400 });
  }
}
