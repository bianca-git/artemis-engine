import { NextResponse } from 'next/server';

import client from './sanityClient';

export async function POST(request: Request) {
  // Accept JSON payload with post and imageUrl
  const payload = await request.json();
  const { post } = payload;

  // Create new post document
  const doc = {
    _type: 'post'
  };

  // Create the post in Sanity as a draft
  await client.create(doc);

  return NextResponse.json({ status: 'success' });
}
