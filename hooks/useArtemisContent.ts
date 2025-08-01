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
    generateVisual,
    generateSocial,
    publishToCms,
    publishVisuals,
  };
}
