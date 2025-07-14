import { useState } from "react";
import { slugify, calculateReadTime, parseCsvData } from "../utils/helpers";

// Types for better clarity (optional, can be improved)
type Topic = {
    ID: string;
    TITLE: string;
    CONTENT: string;
    VISUAL: string;
    [key: string]: any;
};

type WorkflowState = {
    topic: boolean;
    blog: boolean;
    visual: boolean;
    seo: boolean;
    social: boolean;
    cms: boolean;
};

export function useArtemis() {
    // --- State Management ---
    const [csvText, setCsvText] = useState(
        `ID,TITLE,CONTENT,VISUAL
1,"Taming the Cerberus of Spreadsheets","- The three-headed beast of data entry: manual errors, formatting hell, and soul-crushing repetition.<br>- How conventional ""solutions"" like basic macros often create more problems.<br>- Introducing the ""Ghost-in-the-Sheet"" method: using advanced scripting and conditional automation to create a self-correcting, intelligent data entry system.<br>- A step-by-step guide to setting up the core logic.","a vast, glowing holographic spreadsheet whose grid is alive with pulsating data streams"
2,"Escaping the Labyrinth of Project Management Software","- The shared nightmare of bloated PM tools: endless notifications, conflicting ""single sources of truth,"" and the illusion of productivity.<br>- Why adding more integrations often makes the maze more complex.<br>- The ""Ariadne's Thread"" technique: a minimalist framework for centralizing tasks and communication, ruthlessly cutting out feature bloat.<br>- How to build a master dashboard that pulls only critical data, ignoring the noise.","an abstract labyrinth made of glowing purple circuit-board lines, cluttered with flickering, distracting software icons"`
    );
    const [csvData, setCsvData] = useState<Topic[]>(() => parseCsvData(csvText));
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
    const initialWorkflowState: WorkflowState = { topic: false, blog: false, visual: false, seo: false, social: false, cms: false };
    const [workflowState, setWorkflowState] = useState<WorkflowState>(initialWorkflowState);
    const [blogContent, setBlogContent] = useState("");
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [socialPosts, setSocialPosts] = useState<any>(null);
    const [cmsPayload, setCmsPayload] = useState<any>(null);
    const [sanityAssetRef, setSanityAssetRef] = useState("");
    const [seoData, setSeoData] = useState<any>(null);
    const [topicIdeas, setTopicIdeas] = useState<any[]>([]);
    const [topicKeyword, setTopicKeyword] = useState("");
    const [isLoadingBlog, setIsLoadingBlog] = useState(false);
    const [isLoadingVisual, setIsLoadingVisual] = useState(false);
    const [visualLoadingMessage, setVisualLoadingMessage] = useState("");
    const [isLoadingSocial, setIsLoadingSocial] = useState(false);
    const [isLoadingCms, setIsLoadingCms] = useState(false);
    const [isLoadingSeo, setIsLoadingSeo] = useState(false);
    const [isLoadingTopicIdeas, setIsLoadingTopicIdeas] = useState(false);

    // --- Handlers & Logic ---
    const resetGeneratedContent = () => {
        setBlogContent("");
        setImagePrompt("");
        setImageUrl("");
        setSocialPosts(null);
        setCmsPayload(null);
        setSanityAssetRef("");
        setSeoData(null);
    };

    const handleLoadData = () => {
        const data = parseCsvData(csvText);
        setCsvData(data);
        setActiveTopic(null);
        setWorkflowState(initialWorkflowState);
        resetGeneratedContent();
    };

    const selectTopic = (topic: Topic) => {
        setActiveTopic(topic);
        setWorkflowState({ ...initialWorkflowState, topic: true });
        resetGeneratedContent();
    };

    // Example: Amplify Topic (generates more ideas based on a keyword)
    const amplifyTopic = async (keyword: string) => {
        setIsLoadingTopicIdeas(true);
        try {
            // Replace with your actual API call
            const response = await fetch("/api/amplify-topic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword }),
            });
            const data = await response.json();
            setTopicIdeas(data.ideas || []);
        } catch (e) {
            setTopicIdeas([]);
        } finally {
            setIsLoadingTopicIdeas(false);
        }
    };

    // Example: Add Idea to CSV
    const addIdeaToCsv = (idea: any) => {
        const newCsvText = `${csvText}\n${idea.ID},"${idea.TITLE}","${idea.CONTENT}","${idea.VISUAL}"`;
        setCsvText(newCsvText);
        setCsvData(parseCsvData(newCsvText));
    };

    // Example: Generate SEO Data
    const generateSeo = async (topic: Topic) => {
        setIsLoadingSeo(true);
        try {
            // Replace with your actual API call
            const response = await fetch("/api/generate-seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            const data = await response.json();
            setSeoData(data);
            setWorkflowState((prev) => ({ ...prev, seo: true }));
        } catch (e) {
            setSeoData(null);
        } finally {
            setIsLoadingSeo(false);
        }
    };

    // Example: Generate Blog Content
    const generateBlog = async (topic: Topic) => {
        setIsLoadingBlog(true);
        try {
            // Replace with your actual API call
            const response = await fetch("/api/generate-blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            const data = await response.json();
            setBlogContent(data.content || "");
            setWorkflowState((prev) => ({ ...prev, blog: true }));
        } catch (e) {
            setBlogContent("");
        } finally {
            setIsLoadingBlog(false);
        }
    };

    // Example: Generate Visual
    const generateVisual = async (prompt: string) => {
        setIsLoadingVisual(true);
        setVisualLoadingMessage("Generating image...");
        try {
            // Replace with your actual API call
            const response = await fetch("/api/generate-visual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            setImageUrl(data.url || "");
            setSanityAssetRef(data.assetRef || "");
            setWorkflowState((prev) => ({ ...prev, visual: true }));
        } catch (e) {
            setImageUrl("");
            setSanityAssetRef("");
        } finally {
            setIsLoadingVisual(false);
            setVisualLoadingMessage("");
        }
    };

    // Example: Generate Social Posts
    const generateSocial = async (blog: string) => {
        setIsLoadingSocial(true);
        try {
            // Replace with your actual API call
            const response = await fetch("/api/generate-social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blog }),
            });
            const data = await response.json();
            setSocialPosts(data.posts || []);
            setWorkflowState((prev) => ({ ...prev, social: true }));
        } catch (e) {
            setSocialPosts(null);
        } finally {
            setIsLoadingSocial(false);
        }
    };

    // Example: Publish to CMS
    const publishToCms = async (payload: any) => {
        setIsLoadingCms(true);
        try {
            // Replace with your actual API call
            const response = await fetch("/api/publish-cms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            setCmsPayload(data);
            setWorkflowState((prev) => ({ ...prev, cms: true }));
        } catch (e) {
            setCmsPayload(null);
        } finally {
            setIsLoadingCms(false);
        }
    };

    return {
        csvText, setCsvText, csvData, setCsvData, activeTopic, setActiveTopic,
        initialWorkflowState, workflowState, setWorkflowState,
        blogContent, setBlogContent, imagePrompt, setImagePrompt, imageUrl, setImageUrl,
        socialPosts, setSocialPosts, cmsPayload, setCmsPayload, sanityAssetRef, setSanityAssetRef,
        seoData, setSeoData, topicIdeas, setTopicIdeas, topicKeyword, setTopicKeyword,
        isLoadingBlog, setIsLoadingBlog, isLoadingVisual, setIsLoadingVisual, visualLoadingMessage, setVisualLoadingMessage,
        isLoadingSocial, setIsLoadingSocial, isLoadingCms, setIsLoadingCms, isLoadingSeo, setIsLoadingSeo, isLoadingTopicIdeas, setIsLoadingTopicIdeas,
        resetGeneratedContent, handleLoadData, selectTopic,
        amplifyTopic, addIdeaToCsv, generateSeo, generateBlog, generateVisual, generateSocial, publishToCms
    };
}
