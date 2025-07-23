import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Use JWT for service account authentication
async function getAuth() {
  const rawKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';
  // Replace escaped newlines with actual newlines
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const jwtClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes,
  });
  // Authorize client
  await jwtClient.authorize();
  return jwtClient;
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
