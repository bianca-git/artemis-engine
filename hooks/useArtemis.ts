import { useArtemisData } from "./useArtemisData";
import { useArtemisWorkflow } from "./useArtemisWorkflow";
import { useArtemisContent } from "./useArtemisContent";
import { useArtemisUI } from "./useArtemisUI";
import { useWorkflowReset } from "./useGenericReset";
import { useState, useCallback, useMemo } from "react";
import { portableTextToPlainText } from "../utils/helpers";
import type { Topic, BlogContent, SeoData, VisualDescription, SocialPost } from "../types/artemis";

function useArtemis() {
    // Modular hooks
    const data = useArtemisData();
    const workflow = useArtemisWorkflow();
    const content = useArtemisContent();
    const ui = useArtemisUI();

    // Additional state for content and UI not covered by modular hooks
    const [workflowState, setWorkflowState] = useState({
        topic: false,
        blog: false,
        visual: false,
        seo: false,
        social: false,
        cms: false,
    });
    const [blogContent, setBlogContent] = useState("");
    const [portableTextContent, setPortableTextContent] = useState<any[]>([]);
    const [isStreamingBlog, setIsStreamingBlog] = useState(false);
    const [streamingBlogContent, setStreamingBlogContent] = useState("");
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageScene, setImageScene] = useState("");
    const [bodyLanguage, setBodyLanguage] = useState("");
    const [visualDescriptions, setVisualDescriptions] = useState<VisualDescription[]>([]);
    const [selectedVisuals, setSelectedVisuals] = useState<Set<number>>(new Set());
    const [socialPosts, setSocialPosts] = useState<SocialPost[] | null>(null);
    const [cmsPayload, setCmsPayload] = useState<any>(null);
    const [sanityAssetRef, setSanityAssetRef] = useState("");
    const [seoData, setSeoData] = useState<SeoData | null>(null);
    const [topicIdeas, setTopicIdeas] = useState<any[]>([]);
    const [topicKeyword, setTopicKeyword] = useState("");

    // Reset values configuration
    const resetValues = useMemo(() => ({
        blogContent: "",
        portableTextContent: [],
        isStreamingBlog: false,
        streamingBlogContent: "",
        imagePrompt: "",
        imageScene: "",
        bodyLanguage: "",
        visualDescriptions: [],
        selectedVisuals: new Set(),
        socialPosts: null,
        cmsPayload: null,
        sanityAssetRef: "",
        seoData: null,
    }), []);

    // Reset setters configuration
    const resetSetters = useMemo(() => ({
        setBlogContent,
        setPortableTextContent,
        setIsStreamingBlog,
        setStreamingBlogContent,
        setImagePrompt,
        setImageScene,
        setBodyLanguage,
        setVisualDescriptions,
        setSelectedVisuals,
        setSocialPosts,
        setCmsPayload,
        setSanityAssetRef,
        setSeoData,
    }), []);

    // Use the optimized reset utility
    const { resetBlog, resetSeo, resetVisual, resetSocial, resetCms } = useWorkflowReset(
        resetValues,
        resetSetters,
        setWorkflowState
    );

    // Reset generated content utility
    const resetGeneratedContent = useCallback(() => {
        setBlogContent("");
        setPortableTextContent([]);
        setIsStreamingBlog(false);
        setStreamingBlogContent("");
        setImagePrompt("");
        setImageScene("");
        setBodyLanguage("");
        setVisualDescriptions([]);
        setSelectedVisuals(new Set());
        setSocialPosts(null);
        setCmsPayload(null);
        setSeoData(null);
    }, []);

    // Example: Generate SEO Data using modular content and UI hooks
    const generateSeo = useCallback(async (topic: Topic) => {
        ui.setIsLoadingSeo(true);
        try {
            const dataResult = await content.generateSeo(topic);
            setSeoData(dataResult);
            setWorkflowState((prev) => ({ ...prev, seo: true }));
        } catch (e) {
            setSeoData(null);
            console.error('SEO generation error:', e);
        } finally {
            ui.setIsLoadingSeo(false);
        }
    }, [content, ui]);

    // Example: Generate Blog Content
    const generateBlog = useCallback(async (topic: Topic) => {
        ui.setIsLoadingBlog(true);
        try {
            const dataResult = await content.generateBlog(topic) as BlogContent;
            
            // Store both portable text and plain text versions
            const portableText = dataResult.portableText || [];
            const plainText = portableText.length > 0 
                ? portableTextToPlainText(portableText)
                : dataResult.content || "";
            
            setBlogContent(plainText);
            setPortableTextContent(portableText);
            setWorkflowState((prev) => ({ ...prev, blog: true }));
        } catch (e) {
            setBlogContent("");
            setPortableTextContent([]);
            console.error('Blog generation error:', e);
        } finally {
            ui.setIsLoadingBlog(false);
        }
    }, [content, ui]);

    // Streaming Blog Generation
    const generateBlogStreaming = useCallback(
      async (topic: Topic) => {
        ui.setIsLoadingBlog(true);
        setIsStreamingBlog(true);
        setStreamingBlogContent("");
        setBlogContent("");
        setPortableTextContent([]);

        const handleChunk = (chunk: string) => {
          setStreamingBlogContent((prev) => prev + chunk);
        };

        const handleComplete = (fullText: string) => {
          setBlogContent(fullText);
          setIsStreamingBlog(false);
          setStreamingBlogContent("");
          setWorkflowState((prev) => ({ ...prev, blog: true }));
          ui.setIsLoadingBlog(false);
        };

        const handleError = (error: string) => {
          console.error("Streaming blog generation error:", error);
          setIsStreamingBlog(false);
          setStreamingBlogContent("");
          setBlogContent("");
          setPortableTextContent([]);
          ui.setIsLoadingBlog(false);
        };

                try {
                                        await content.generateBlogStreaming(
                                            topic,
                                            handleChunk,
                                            handleComplete,
                                            handleError
                                        );
        } catch (e) {
          handleError(e instanceof Error ? e.message : "Unknown error");
        }
      },
      [content, ui]
    );

    // Example: Generate Visual
    const generateVisual = useCallback(async (visualSource: string | { prompt: string; location?: string; pose?: string; aspectRatio?: string; sampleCount?: number; outputMimeType?: string; personGeneration?: string }, scene: string, bodyLanguage: string) => {
        ui.setIsLoadingVisual(true);
        ui.setVisualLoadingMessage("Generating image descriptions...");
        try {
            let visualObj: { prompt: string; location?: string; pose?: string; aspectRatio?: string; sampleCount?: number; outputMimeType?: string; personGeneration?: string };
            if (typeof visualSource === 'string') {
                try {
                    visualObj = JSON.parse(visualSource);
                } catch {
                    visualObj = { prompt: visualSource };
                }
            } else {
                visualObj = visualSource;
            }
            if (!visualObj.prompt) visualObj.prompt = '';

            const visualPayload = {
                prompt: visualObj.prompt,
                aspectRatio: visualObj.aspectRatio || "16:9",
                sampleCount: visualObj.sampleCount ?? 1,
                outputMimeType: "image/png",
                personGeneration: visualObj.personGeneration ?? "ALLOW_ADULT",
            };

            const dataResult = await content.generateVisual(visualPayload, scene, bodyLanguage) as any;
            setVisualDescriptions(dataResult.descriptions || []);
            setWorkflowState((prev) => ({ ...prev, visual: true }));
        } catch (e) {
            setVisualDescriptions([]);
            console.error('Visual generation error:', e);
        } finally {
            ui.setIsLoadingVisual(false);
            ui.setVisualLoadingMessage("");
        }
    }, [content, ui]);

    // Example: Generate Social Posts
    const generateSocial = useCallback(async (blog: string) => {
        ui.setIsLoadingSocial(true);
        try {
            const dataResult = await content.generateSocial(blog) as { posts: SocialPost[] };
            setSocialPosts(dataResult.posts || []);
            setWorkflowState((prev) => ({ ...prev, social: true }));
        } catch (e) {
            setSocialPosts(null);
            console.error('Social generation error:', e);
        } finally {
            ui.setIsLoadingSocial(false);
        }
    }, [content, ui]);

    // Example: Publish to CMS
    const publishToCms = useCallback(async (payload: any, blogContent: string, seoData: any, socialPosts: any, visualDescriptions: any[], sanityAssetRef: string) => {
        ui.setIsLoadingCms(true);
        try {
            const dataResult = await content.publishToCms(payload);
            setCmsPayload(dataResult);
            setWorkflowState((prev) => ({ ...prev, cms: true }));
        } catch (e) {
            setCmsPayload(null);
            console.error('CMS publishing error:', e);
        } finally {
            ui.setIsLoadingCms(false);
        }
    }, [content, ui]);

    // Example: Amplify Topic
    const amplifyTopic = useCallback(async (keyword: string) => {
        ui.setIsLoadingTopicIdeas(true);
        try {
            const dataResult = await content.amplifyTopic(keyword) as { ideas: any[] };
            setTopicIdeas(dataResult.ideas || []);
            return dataResult.ideas || [];
        } catch (e) {
            setTopicIdeas([]);
            console.error('Topic amplification error:', e);
            return [];
        } finally {
            ui.setIsLoadingTopicIdeas(false);
        }
    }, [content, ui]);

    // Visual selection handler with optimized Set operations for O(1) lookups
    const handleVisualSelection = useCallback((index: number) => {
        setSelectedVisuals((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);
    
    // Publish selected visuals to Google Sheets
    const publishVisualsToSheet = useCallback(async () => {
        ui.setIsLoadingVisual(true);
        try {
            const selected = visualDescriptions.filter((_, idx) => selectedVisuals.has(idx));
            await content.publishVisuals(selected);
            setWorkflowState((prev) => ({ ...prev, visual: true }));
        } catch (e) {
            console.error('Visual publishing error:', e);
        } finally {
            ui.setIsLoadingVisual(false);
        }
    }, [visualDescriptions, selectedVisuals, content, ui]);

    const addIdeaToCsv = data.addIdeaToCsv;
    const handleLoadData = data.handleLoadData;
    const selectTopic = data.selectTopic;

    return {
        // Data
        ...data,
        // Workflow
        ...workflow,
        workflowState,
        setWorkflowState,
        // Content API
        ...content,
        // UI State
        ...ui,
        // Local state
        blogContent, setBlogContent,
        portableTextContent, setPortableTextContent,
        isStreamingBlog, setIsStreamingBlog,
        streamingBlogContent, setStreamingBlogContent,
        imagePrompt, setImagePrompt,
        imageScene, setImageScene,
        bodyLanguage, setBodyLanguage,
        visualDescriptions,
        selectedVisuals,
        handleVisualSelection,
        publishVisualsToSheet,
        // CMS asset ref
        sanityAssetRef, setSanityAssetRef,
        socialPosts, setSocialPosts,
        cmsPayload, setCmsPayload,
        seoData, setSeoData,
        topicIdeas, setTopicIdeas,
        topicKeyword, setTopicKeyword,
        resetGeneratedContent,
        handleLoadData,
        selectTopic,
        amplifyTopic,
        addIdeaToCsv,
        generateSeo,
        generateBlog,
        generateBlogStreaming,
        generateVisual,
        generateSocial,
        publishToCms,
        // Reset handlers
        resetBlog,
        resetSeo,
        resetVisual,
        resetSocial,
        resetCms
    };
}

export default useArtemis;
