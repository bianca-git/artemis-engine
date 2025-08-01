
import { useLoadingState, useLoadingWithMessage } from './useLoadingState';

/**
 * Optimized UI state management using generic loading state utilities
 * Eliminates DRY violations in loading state management
 */
export function useArtemisUI() {
  // Use the generic loading state manager for all loading states
  const [loadingState, loadingActions] = useLoadingState({
    blog: false,
    seo: false,
    social: false,
    cms: false,
    topicIdeas: false,
  });

  // Special loading state for visual with message
  const visualLoading = useLoadingWithMessage(false, '');

  return {
    // Individual loading states (for backward compatibility)
    isLoadingBlog: loadingState.blog,
    isLoadingSeo: loadingState.seo,
    isLoadingSocial: loadingState.social,
    isLoadingCms: loadingState.cms,
    isLoadingTopicIdeas: loadingState.topicIdeas,
    isLoadingVisual: visualLoading.isLoading,
    visualLoadingMessage: visualLoading.message,

    // Setters (for backward compatibility)
    setIsLoadingBlog: (loading: boolean) => loadingActions.setLoading('blog', loading),
    setIsLoadingSeo: (loading: boolean) => loadingActions.setLoading('seo', loading),
    setIsLoadingSocial: (loading: boolean) => loadingActions.setLoading('social', loading),
    setIsLoadingCms: (loading: boolean) => loadingActions.setLoading('cms', loading),
    setIsLoadingTopicIdeas: (loading: boolean) => loadingActions.setLoading('topicIdeas', loading),
    setIsLoadingVisual: visualLoading.setIsLoading,
    setVisualLoadingMessage: visualLoading.setMessage,

    // Enhanced actions
    ...loadingActions,
    startVisualLoading: visualLoading.startLoading,
    stopVisualLoading: visualLoading.stopLoading,
    updateVisualMessage: visualLoading.updateMessage,
  };
}
