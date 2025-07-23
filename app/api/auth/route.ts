import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  const { token } = await request.json();
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    // TODO: create or fetch user session here, e.g. set a cookie
    return NextResponse.json({ status: 'success', user: payload });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: (err as Error).message }, { status: 401 });
  }
}
