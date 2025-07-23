import { NextResponse } from 'next/server';

import client from './sanityClient';
import { Readable } from 'stream';

export async function POST(request: Request) {
  // Accept JSON payload with post and imageUrl
  const payload = await request.json();
  const { post, imageUrl } = payload;

  let imageAssetRef = post?.image?.asset?._ref || '';

  // If imageUrl is provided, upload image to Sanity
  if (imageUrl) {
    try {
      // Fetch image as a stream
      const imageRes = await fetch(imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Upload image
      const asset = await client.assets.upload('image', buffer, {
        filename: 'generated-image.jpg',
      });
      imageAssetRef = asset._id;
    } catch (err) {
      // fallback: no image
      imageAssetRef = '';
    }
  }

  // Prepare Sanity post document (no image reference)
  // Create new post document
  const doc = {
    _type: 'post',
    slug: typeof post.slug === 'string' ? { current: post.slug } : post.slug,
    author: post.author,
    categories: post.categories,
    body: post.body,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    featured: post.featured,
    readTime: post.readTime,
    preview: post.preview,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt,
  };

  // Create the post in Sanity as a draft
  const result = await client.create(doc);

  return NextResponse.json({ status: 'success', result });
}
