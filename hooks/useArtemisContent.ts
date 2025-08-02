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
    const response = await apiClient.post('/generate-blog', { topic });
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate blog');
    }
    return response.data || { content: "", portableText: [] };
  };

  const generateBlogStreaming = async (
    topic: Topic, 
    onChunk: (content: string, portableText: any[]) => void,
    onComplete: (content: string, portableText: any[]) => void,
    onError: (error: string) => void
  ) => {
    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'chunk') {
                    onChunk(parsed.content, parsed.portableText);
                  } else if (parsed.type === 'complete') {
                    onComplete(parsed.content, parsed.portableText);
                    return;
                  }
                } catch (e) {
                  console.warn(`Failed to parse streaming data '${data}':`, e);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError(error instanceof Error ? error.message : 'Streaming failed');
    }
  };

  const generateVisual = async (prompt: string, scene: string, bodyLanguage: string) => {
    const response = await apiClient.post('/generate-visual', { prompt, scene, bodyLanguage });
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate visual descriptions');
    }
    return response.data || { descriptions: [] };
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
