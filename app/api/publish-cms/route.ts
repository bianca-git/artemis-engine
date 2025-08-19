import { NextResponse } from 'next/server';
import client from './sanityClient';

/**
 * Optimized CMS publishing API with input validation and error handling
 */
export async function POST(request: Request) {
  // If the client is not configured, return a mock response
  if (!client) {
    console.log("Sanity client not configured. Returning mock success response.");
    return NextResponse.json({
      status: 'success',
      message: 'Mock post successfully created in CMS.',
      postId: `mock-${Date.now()}`,
      data: { _id: `mock-${Date.now()}`, title: 'Mock Post' }
    });
  }

  try {
    const payload = await request.json();
    
    // Input validation
    if (!payload) {
      return NextResponse.json({ 
        error: 'Request payload is required.' 
      }, { status: 400 });
    }

    const { post, title, content, seo, visuals, socialPosts } = payload;

    // Basic validation for required fields
    if (!post && !title) {
      return NextResponse.json({ 
        error: 'Either post object or title is required.' 
      }, { status: 400 });
    }

    try {
      // Create comprehensive post document
      const doc = {
        _type: 'post',
        title: title || post?.title || 'Untitled Post',
        slug: {
          current: (title || post?.title || 'untitled-post')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        },
        content: content || post?.content || [],
        seo: seo ? {
          metaTitle: seo.metaTitle || '',
          metaDescription: seo.metaDescription || '',
          keywords: seo.keywords || []
        } : undefined,
        visuals: visuals || [],
        socialPosts: socialPosts || [],
        publishedAt: new Date().toISOString(),
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };

      // Create the post in Sanity as a draft
      const result = await client.create(doc);

      return NextResponse.json({ 
        status: 'success',
        message: 'Post successfully created in CMS.',
        postId: result._id,
        data: result
      });

    } catch (sanityError: any) {
      console.error('Sanity CMS error:', sanityError);
      return NextResponse.json({ 
        status: 'error',
        error: 'Failed to publish to CMS: ' + (sanityError?.message || 'Unknown error')
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('CMS publishing error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Invalid request format.' 
    }, { status: 400 });
  }
}
