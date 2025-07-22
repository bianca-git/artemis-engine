import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

export async function appendToSheet(values: string[][]) {
  const auth = await getAuth();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error('Google Sheets Spreadsheet ID is not configured.');
  }

  const request = {
    spreadsheetId,
    range: 'STUFF!A1', // Assumes you want to append to the STUFF sheet
    valueInputOption: 'USER_ENTERED',
    resource: {
      values,
    },
    auth,
  };

  try {
    const response = await sheets.spreadsheets.values.append(request);
    return response.data;
  } catch (err) {
    console.error('Error appending to Google Sheet:', err);
    throw new Error('Failed to append data to Google Sheet.');
  }
}
