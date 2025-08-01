import { useCallback } from 'react';

/**
 * Generic reset utility to eliminate DRY violations in reset functions
 * Replaces repetitive reset patterns across the application
 */

export type ResetConfig<T> = {
  [K in keyof T]: T[K];
};

export type StateSetters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

/**
 * Creates a generic reset function for multiple state values
 */
export function useGenericReset<T extends Record<string, any>>(
  resetConfig: ResetConfig<T>,
  setters: Partial<StateSetters<T>>
) {
  return useCallback(
    (keysToReset?: (keyof T)[]) => {
      const keys = keysToReset || Object.keys(resetConfig);
      
      keys.forEach((key) => {
        const setterName = `set${String(key).charAt(0).toUpperCase()}${String(key).slice(1)}` as keyof StateSetters<T>;
        const setter = setters[setterName];
        
        if (setter && typeof setter === 'function') {
          setter(resetConfig[key]);
        }
      });
    },
    [resetConfig, setters]
  );
}

/**
 * Workflow state reset utility
 */
export interface WorkflowResetConfig {
  blog: string[];
  seo: string[];
  visual: string[];
  social: string[];
  cms: string[];
}

export function useWorkflowReset(
  resetValues: Record<string, any>,
  setters: Record<string, (value: any) => void>,
  setWorkflowState: (updater: (prev: any) => any) => void
) {
  const resetStep = useCallback((
    step: keyof WorkflowResetConfig,
    stateKeys: string[],
    downstreamSteps: string[] = []
  ) => {
    // Reset the specified state values
    stateKeys.forEach(key => {
      if (setters[key]) {
        setters[key](resetValues[key]);
      }
    });

    // Reset workflow state for current and downstream steps
    const stepsToReset = [step, ...downstreamSteps];
    setWorkflowState((prev: any) => {
      const newState = { ...prev };
      stepsToReset.forEach(stepKey => {
        newState[stepKey] = false;
      });
      return newState;
    });
  }, [resetValues, setters, setWorkflowState]);

  return {
    resetBlog: useCallback(() => resetStep('blog', ['blogContent', 'portableTextContent'], ['seo', 'visual', 'social', 'cms']), [resetStep]),
    resetSeo: useCallback(() => resetStep('seo', ['seoData'], ['visual', 'social', 'cms']), [resetStep]),
    resetVisual: useCallback(() => resetStep('visual', ['imagePrompt', 'imageScene', 'bodyLanguage', 'visualDescriptions', 'selectedVisuals'], ['social', 'cms']), [resetStep]),
    resetSocial: useCallback(() => resetStep('social', ['socialPosts'], ['cms']), [resetStep]),
    resetCms: useCallback(() => resetStep('cms', ['cmsPayload', 'sanityAssetRef'], []), [resetStep]),
  };
}