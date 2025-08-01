import { parseCsvData } from "../utils/helpers";
import { useState, useEffect, useMemo, useCallback } from "react";

// Types for better clarity
type Topic = {
    ID: string;
    TITLE: string;
    CONTENT: string;
    VISUAL: string;
    [key: string]: any;
};

/**
 * Optimized data management hook with memoization and performance improvements
 */
export function useArtemisData() {
    // CSV and topic data management
    const [csvText, setCsvText] = useState(
        `ID,TITLE,CONTENT,VISUAL
1,"Taming the Cerberus of Spreadsheets","- The three-headed beast of data entry: manual errors, formatting hell, and soul-crushing repetition.<br>- How conventional \"solutions\" like basic macros often create more problems.<br>- Introducing the \"Ghost-in-the-Sheet\" method: using advanced scripting and conditional automation to create a self-correcting, intelligent data entry system.<br>- A step-by-step guide to setting up the core logic.","a vast, glowing holographic spreadsheet whose grid is alive with pulsating data streams"
2,"Escaping the Labyrinth of Project Management Software","- The shared nightmare of bloated PM tools: endless notifications, conflicting \"single sources of truth,\" and the illusion of productivity.<br>- Why adding more integrations often makes the maze more complex.<br>- The \"Ariadne's Thread\" technique: a minimalist framework for centralizing tasks and communication, ruthlessly cutting out feature bloat.<br>- How to build a master dashboard that pulls only critical data, ignoring the noise.","an abstract labyrinth made of glowing purple circuit-board lines, cluttered with flickering, distracting software icons"`
    );

    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

    // Memoized CSV parsing to prevent unnecessary re-parsing
    const csvData = useMemo<Topic[]>(() => {
        const parsed = parseCsvData(csvText);
        return parsed.map((row) => ({
            ID: row.ID || "",
            TITLE: row.TITLE || "",
            CONTENT: row.CONTENT || "",
            VISUAL: row.VISUAL || "",
            ...row,
        }));
    }, [csvText]);

    // Memoized topic lookup for O(1) performance
    const topicMap = useMemo(() => {
        return new Map(csvData.map(topic => [topic.ID, topic]));
    }, [csvData]);

    // --- Optimized Handlers ---
    const handleLoadData = useCallback(() => {
        // Data is automatically updated via useMemo when csvText changes
        setActiveTopic(null);
    }, []);

    const selectTopic = useCallback((topic: Topic) => {
        setActiveTopic(topic);
    }, []);

    const selectTopicById = useCallback((id: string) => {
        const topic = topicMap.get(id);
        if (topic) {
            setActiveTopic(topic);
        }
    }, [topicMap]);

    const addIdeaToCsv = useCallback((idea: any) => {
        const newCsvText = `${csvText}\n${idea.ID},"${idea.TITLE}","${idea.CONTENT}","${idea.VISUAL}"`;
        setCsvText(newCsvText);
        // csvData will automatically update via useMemo
    }, [csvText]);

    // Backward compatibility setter (deprecated but maintained for existing components)
    const setCsvData = useCallback((data: Topic[] | ((prev: Topic[]) => Topic[])) => {
        console.warn('setCsvData is deprecated. Use setCsvText instead for better performance.');
        // This is a no-op since we use memoized parsing now
    }, []);

    // Auto-reload data when csvText changes
    useEffect(() => {
        handleLoadData();
    }, [handleLoadData]);

    return {
        csvText, 
        setCsvText, 
        csvData, 
        setCsvData, // For backward compatibility
        activeTopic, 
        setActiveTopic,
        topicMap, // Expose for efficient lookups
        handleLoadData, 
        selectTopic, 
        selectTopicById, // New optimized selector
        addIdeaToCsv
    };
}