/**
 * Comprehensive TypeScript types for better type safety and IntelliSense
 * Eliminates type-related bugs and improves developer experience
 */

// Core domain types
export interface Topic {
  ID: string;
  TITLE: string;
  CONTENT: string;
  VISUAL: string;
  [key: string]: any;
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  error?: string;
}

export interface BlogContent {
  content: string;
  portableText: PortableTextBlock[];
}

export interface VisualDescription {
  "Image Name": string;
  "Caption Plan": string;
  "Target Audience": string;
  "Keywords": string[];
  "Platform": string;
}

export interface SocialPost {
  platform: string;
  content: string;
  hashtags: string[];
}

export interface CmsPayload {
  title: string;
  content: PortableTextBlock[];
  seo: SeoData;
  visuals: VisualDescription[];
  socialPosts: SocialPost[];
  sanityAssetRef?: string;
}

// Portable Text types (for Sanity CMS)
export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: PortableTextSpan[];
  markDefs?: any[];
}

export interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

// Workflow state types
export interface WorkflowState {
  topic: boolean;
  blog: boolean;
  visual: boolean;
  seo: boolean;
  social: boolean;
  cms: boolean;
}

// Loading state types
export interface LoadingStates {
  blog: boolean;
  seo: boolean;
  visual: boolean;
  social: boolean;
  cms: boolean;
  topicIdeas: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

// Hook return types
export interface ArtemisData {
  csvText: string;
  setCsvText: (text: string) => void;
  csvData: Topic[];
  activeTopic: Topic | null;
  setActiveTopic: (topic: Topic | null) => void;
  topicMap: Map<string, Topic>;
  handleLoadData: () => void;
  selectTopic: (topic: Topic) => void;
  selectTopicById: (id: string) => void;
  addIdeaToCsv: (idea: any) => void;
}

export interface ArtemisUI {
  isLoadingBlog: boolean;
  isLoadingSeo: boolean;
  isLoadingVisual: boolean;
  isLoadingSocial: boolean;
  isLoadingCms: boolean;
  isLoadingTopicIdeas: boolean;
  visualLoadingMessage: string;
  setIsLoadingBlog: (loading: boolean) => void;
  setIsLoadingSeo: (loading: boolean) => void;
  setIsLoadingVisual: (loading: boolean) => void;
  setIsLoadingSocial: (loading: boolean) => void;
  setIsLoadingCms: (loading: boolean) => void;
  setIsLoadingTopicIdeas: (loading: boolean) => void;
  setVisualLoadingMessage: (message: string) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  resetAll: () => void;
}

export interface ArtemisContent {
  amplifyTopic: (keyword: string) => Promise<{ ideas: any[] }>;
  generateSeo: (topic: Topic) => Promise<SeoData>;
  generateBlog: (topic: Topic) => Promise<BlogContent>;
  generateVisual: (prompt: string, scene: string, bodyLanguage: string) => Promise<{ descriptions: VisualDescription[] }>;
  generateSocial: (blog: string) => Promise<{ posts: SocialPost[] }>;
  publishToCms: (payload: CmsPayload) => Promise<any>;
  publishVisuals: (descriptions: VisualDescription[]) => Promise<any>;
}

// Component prop types
export interface StepCardProps {
  title: string;
  icon: React.ComponentType;
  isUnlocked: boolean;
  isComplete: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  onReset?: () => void;
  children: React.ReactNode;
}

export interface TopicAmplifierProps {
  onAmplify: (keyword: string) => Promise<any[]>;
  onAddIdea: (idea: any) => void;
  isLoading: boolean;
}

// Error types
export interface ArtemisError {
  message: string;
  code?: string;
  details?: any;
}

// Configuration types
export interface ArtemisConfig {
  openaiApiKey?: string;
  sanityProjectId?: string;
  sanityDataset?: string;
  googleSheetsId?: string;
}