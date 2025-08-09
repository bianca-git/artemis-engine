// Central AI configuration utilities for GPT-5 series
// Provides shared model allow list, defaults, and parameter normalization.

export const ALLOWED_MODELS = ["gpt-5", "gpt-5-mini", "gpt-5-nano"] as const;
export type AllowedModel = typeof ALLOWED_MODELS[number];

export interface AIRequestOptionsInput {
  model?: string;
  verbosity?: 'low' | 'medium' | 'high';
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
}

export interface NormalizedAIOptions {
  model: AllowedModel;
  text: { format: { type: 'text' }; verbosity?: 'low' | 'medium' | 'high' };
  reasoning?: { effort: 'minimal' | 'low' | 'medium' | 'high' };
}

const DEFAULT_MODEL_BLOG: AllowedModel = 'gpt-5';
const DEFAULT_MODEL_SEO: AllowedModel = 'gpt-5-nano';
const DEFAULT_MODEL_AMPLIFY: AllowedModel = 'gpt-5-nano';

export const defaultModels = {
  blog: DEFAULT_MODEL_BLOG,
  seo: DEFAULT_MODEL_SEO,
  amplify: DEFAULT_MODEL_AMPLIFY,
};

export function normalizeAIOptions(kind: 'blog' | 'seo' | 'amplify', input?: AIRequestOptionsInput): NormalizedAIOptions {
  const model = (input?.model && ALLOWED_MODELS.includes(input.model as AllowedModel)
    ? input.model
    : defaultModels[kind]) as AllowedModel;

  const verbosity = input?.verbosity && ['low', 'medium', 'high'].includes(input.verbosity)
    ? input.verbosity
    : undefined; // omit to use model default (medium)

  const reasoningEffort = input?.reasoningEffort && ['minimal', 'low', 'medium', 'high'].includes(input.reasoningEffort)
    ? input.reasoningEffort
    : (kind === 'seo' || kind === 'amplify') ? 'minimal' : undefined; // blog stays medium default unless specified

  const text: any = { format: { type: 'text' } };
  if (verbosity && verbosity !== 'medium') text.verbosity = verbosity; // avoid redundant medium

  const reasoning = reasoningEffort ? { effort: reasoningEffort } : undefined;

  return { model, text, reasoning } as NormalizedAIOptions;
}
