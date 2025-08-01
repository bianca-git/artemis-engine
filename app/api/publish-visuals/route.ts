import { NextResponse } from 'next/server';
import { appendToSheet } from '../../../utils/googleSheets';

/**
 * Optimized visual publishing API with comprehensive input validation
 */
export async function POST(request: Request) {
  try {
    const { descriptions } = await request.json();

    // Input validation
    if (!descriptions) {
      return NextResponse.json({ 
        success: false, 
        error: 'Descriptions parameter is required.' 
      }, { status: 400 });
    }

    if (!Array.isArray(descriptions)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Descriptions must be an array.' 
      }, { status: 400 });
    }

    if (descriptions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one description is required.' 
      }, { status: 400 });
    }

    // Validate each description object
    const requiredFields = ["Image Name", "Caption Plan", "Target Audience", "Keywords", "Platform"];
    for (let i = 0; i < descriptions.length; i++) {
      const desc = descriptions[i];
      for (const field of requiredFields) {
        if (!desc[field]) {
          return NextResponse.json({ 
            success: false, 
            error: `Description ${i + 1} is missing required field: ${field}` 
          }, { status: 400 });
        }
      }
    }

    try {
      // Transform data for Google Sheets
      const values = descriptions.map(desc => [
        desc["Image Name"],
        desc["Caption Plan"],
        desc["Target Audience"],
        Array.isArray(desc["Keywords"]) ? desc["Keywords"].join(", ") : desc["Keywords"],
        desc["Platform"],
        'Draft' // Default status
      ]);

      const sheetData = await appendToSheet(values);

      return NextResponse.json({ 
        success: true, 
        sheetData,
        message: `Successfully published ${descriptions.length} visual descriptions to Google Sheets.`
      });

    } catch (sheetsError: any) {
      console.error('Google Sheets append error:', sheetsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to publish to Google Sheets: ' + (sheetsError?.message || 'Unknown error')
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Visual publishing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid request format.' 
    }, { status: 400 });
  }
}
