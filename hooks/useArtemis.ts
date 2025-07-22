


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
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageScene, setImageScene] = useState("");
    const [bodyLanguage, setBodyLanguage] = useState("");
    const [visualDescriptions, setVisualDescriptions] = useState<any[]>([]);
    const [selectedVisuals, setSelectedVisuals] = useState<Set<number>>(new Set());
    const [socialPosts, setSocialPosts] = useState<any>(null);
    const [cmsPayload, setCmsPayload] = useState<any>(null);
    const [sanityAssetRef, setSanityAssetRef] = useState("");
    // ...existing code for other state
    const [seoData, setSeoData] = useState<any>(null);
    const [topicIdeas, setTopicIdeas] = useState<any[]>([]);
    const [topicKeyword, setTopicKeyword] = useState("");

    // Reset generated content utility
    const resetGeneratedContent = () => {
        setBlogContent("");
        setImagePrompt("");
        setImageScene("");
        setBodyLanguage("");
        setVisualDescriptions([]);
        setSelectedVisuals(new Set());
        setSocialPosts(null);
        setCmsPayload(null);
        setSeoData(null);
    };

    // Example: Generate SEO Data using modular content and UI hooks
    const generateSeo = async (topic: any) => {
        ui.setIsLoadingSeo(true);
        try {
            const dataResult = await content.generateSeo(topic);
            setSeoData(dataResult);
            setWorkflowState((prev: any) => ({ ...prev, seo: true }));
        } catch (e) {
            setSeoData(null);
        } finally {
            ui.setIsLoadingSeo(false);
        }
    };

    // Example: Generate Blog Content
    const generateBlog = async (topic: any) => {
        ui.setIsLoadingBlog(true);
        try {
            const dataResult = await content.generateBlog(topic);
            setBlogContent(dataResult.content || "");
            setWorkflowState((prev: any) => ({ ...prev, blog: true }));
        } catch (e) {
            setBlogContent("");
        } finally {
            ui.setIsLoadingBlog(false);
        }
    };

    // Example: Generate Visual
    const generateVisual = async (prompt: string, scene: string, bodyLanguage: string) => {
        ui.setIsLoadingVisual(true);
        ui.setVisualLoadingMessage("Generating image descriptions...");
        try {
            const dataResult = await content.generateVisual(prompt, scene, bodyLanguage);
            setVisualDescriptions(dataResult.descriptions || []);
            setWorkflowState((prev: any) => ({ ...prev, visual: true }));
        } catch (e) {
            setVisualDescriptions([]);
        } finally {
            ui.setIsLoadingVisual(false);
            ui.setVisualLoadingMessage("");
        }
    };

    // Example: Generate Social Posts
    const generateSocial = async (blog: string) => {
        ui.setIsLoadingSocial(true);
        try {
            const dataResult = await content.generateSocial(blog);
            setSocialPosts(dataResult.posts || []);
            setWorkflowState((prev: any) => ({ ...prev, social: true }));
        } catch (e) {
            setSocialPosts(null);
        } finally {
            ui.setIsLoadingSocial(false);
        }
    };

    // Example: Publish to CMS
    const publishToCms = async (payload: any) => {
        ui.setIsLoadingCms(true);
        try {
            const dataResult = await content.publishToCms(payload);
            setCmsPayload(dataResult);
            setWorkflowState((prev: any) => ({ ...prev, cms: true }));
        } catch (e) {
            setCmsPayload(null);
        } finally {
            ui.setIsLoadingCms(false);
        }
    };

    // Example: Amplify Topic
    const amplifyTopic = async (keyword: string) => {
        ui.setIsLoadingTopicIdeas(true);
        try {
            const dataResult = await content.amplifyTopic(keyword);
            setTopicIdeas(dataResult.ideas || []);
        } catch (e) {
            setTopicIdeas([]);
        } finally {
            ui.setIsLoadingTopicIdeas(false);
        }
    };

    // Visual selection handler
    const handleVisualSelection = (index: number) => {
        setSelectedVisuals((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };
    
    // Publish selected visuals to Google Sheets
    const publishVisualsToSheet = async () => {
        ui.setIsLoadingVisual(true);
        try {
            const selected = visualDescriptions.filter((_, idx) => selectedVisuals.has(idx));
            await content.publishVisuals(selected);
            setWorkflowState((prev: any) => ({ ...prev, visual: true }));
        } catch (e) {
            // handle error
        } finally {
            ui.setIsLoadingVisual(false);
        }
    };
    const addIdeaToCsv = data.addIdeaToCsv;

    // Data loading and topic selection
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
        generateVisual,
        generateSocial,
        publishToCms
    };
}
export default useArtemis;
import { useArtemisData } from "./useArtemisData";
import { useArtemisWorkflow } from "./useArtemisWorkflow";
import { useArtemisContent } from "./useArtemisContent";
import { useArtemisUI } from "./useArtemisUI";
import { useState } from "react";
