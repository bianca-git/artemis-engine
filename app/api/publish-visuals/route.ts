import { NextResponse } from 'next/server';
import { appendToSheet } from '../../../utils/googleSheets';

export async function POST(request: Request) {
  const { descriptions } = await request.json();
  let error = null;
  let sheetData = null;

  if (!Array.isArray(descriptions) || descriptions.length === 0) {
    return NextResponse.json({ success: false, error: 'No descriptions provided.' }, { status: 400 });
  }

  try {
    const values = descriptions.map(desc => [
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
    console.error('Google Sheets append error:', error);
  }

  return NextResponse.json({ success: !error, sheetData, error });
}
