
import { useState } from "react";
export function useArtemisUI() {
    // --- UI State Management ---
    const [isLoadingBlog, setIsLoadingBlog] = useState(false);
    const [isLoadingVisual, setIsLoadingVisual] = useState(false);
    const [visualLoadingMessage, setVisualLoadingMessage] = useState("");
    const [isLoadingSocial, setIsLoadingSocial] = useState(false);
    const [isLoadingCms, setIsLoadingCms] = useState(false);
    const [isLoadingSeo, setIsLoadingSeo] = useState(false);
    const [isLoadingTopicIdeas, setIsLoadingTopicIdeas] = useState(false);

    return {
        isLoadingBlog, setIsLoadingBlog,
        isLoadingVisual, setIsLoadingVisual,
        visualLoadingMessage, setVisualLoadingMessage,
        isLoadingSocial, setIsLoadingSocial,
        isLoadingCms, setIsLoadingCms,
        isLoadingSeo, setIsLoadingSeo,
        isLoadingTopicIdeas, setIsLoadingTopicIdeas
    };
}
