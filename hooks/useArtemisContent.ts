import { apiClient } from '../utils/apiClient';
import type { Topic, SeoData, BlogContent, VisualDescription, SocialPost } from '../types/artemis';

/**
 * Optimized content generation API hook using centralized API client
 * Eliminates DRY violations and improves error handling
 */
export function useArtemisContent() {
  // --- Content Generation API Handlers ---
  const amplifyTopic = async (keyword: string) => {
    const response = await apiClient.post('/amplify-topic', { keyword });
    if (!response.success) {
      throw new Error(response.error || 'Failed to amplify topic');
    }
    return response.data || { ideas: [] };
  };

  const generateSeo = async (topic: Topic) => {
    const response = await apiClient.post('/generate-seo', { topic });
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate SEO');
    }
    
    // Ensure only metaTitle, metaDescription, and keywords are returned
    const data = response.data as any || {};
    return {
      metaTitle: data.metaTitle || "",
      metaDescription: data.metaDescription || "",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      error: data.error // include error if present
    };
  };

  const generateBlog = async (topic: Topic) => {
    // Send only required fields to avoid oversized or non-serializable payloads
    const response = await apiClient.post('/generate-blog', {
      topic: {
        TITLE: topic?.TITLE || "",
        CONTENT: topic?.CONTENT || ""
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate blog');
    }
    return response.data || { content: "", portableText: [] };
  };

  const generateBlogStreaming = async (
    topic: Topic,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (err: string) => void
  ) => {
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: {
            TITLE: topic?.TITLE || "",
            CONTENT: topic?.CONTENT || ""
          },
          stream: true
        }),
      });
      if (!res.body) throw new Error('No streaming body.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: rDone } = await reader.read();
        done = rDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          onChunk(chunk);
        }
      }

      onComplete(accumulated);
    } catch (e: any) {
      onError(e.message);
    }
  };

  const generateVisual = async (visual: { prompt: string; aspectRatio?: string; sampleCount?: number; outputMimeType?: string; personGeneration?: string }, _scene?: string, _bodyLanguage?: string) => {
    // Construct EXACT shape expected by server / external API.
    const payload = {
      instances: [ { prompt: visual.prompt } ],
      parameters: {
        outputMimeType: visual.outputMimeType || 'image/png',
        sampleCount: visual.sampleCount ?? 1,
        personGeneration: visual.personGeneration || 'ALLOW_ADULT',
        aspectRatio: (visual.aspectRatio || '16:9').replace('x', ':')
      }
    } as const;
    const response = await apiClient.post('/generate-visual', payload);
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate visual descriptions');
    }
    return response.data || { descriptions: [], size: { width: 2, height: 1 } };
  };

  const generateSocial = async (blog: string) => {
    const response = await apiClient.post('/generate-social', { blog });
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate social posts');
    }
    return response.data || { posts: [] };
  };

  const publishToCms = async (payload: any) => {
    const response = await apiClient.post('/publish-cms', payload);
    if (!response.success) {
      throw new Error(response.error || 'Failed to publish to CMS');
    }
    return response.data || {};
  };
  
  const publishVisuals = async (descriptions: VisualDescription[]) => {
    const response = await apiClient.post('/publish-visuals', { descriptions });
    if (!response.success) {
      throw new Error(response.error || 'Failed to publish visual descriptions');
    }
    return response.data || {};
  };

  return {
    amplifyTopic,
    generateSeo,
    generateBlog,
    generateBlogStreaming,
    generateVisual,
    generateSocial,
    publishToCms,
    publishVisuals,
  };
}
