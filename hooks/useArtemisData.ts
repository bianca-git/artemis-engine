"use client";

import { parseCsvData } from "../utils/helpers";
import { useState, useEffect, useMemo, useCallback } from "react";
// Note: We purposely avoid importing 'fs' or 'path' at the module level so this hook
// can be used in Client Components without causing bundling errors. We'll dynamically
// import them only when executing on the server (typeof window === 'undefined').
/**
 * Optimized topic amplification API with input validation and error handling
 */

// Cache the developer prompt to avoid re-reading on every request
let cachedData: string | null = null;

/**
 * Loads and caches the CSV data.
 * - On the server: reads the file directly from the filesystem (faster, no fetch).
 * - On the client: fetches the file from the public assets (must exist under /public).
 *
 * IMPORTANT: For the client-side branch to work, ensure `defaultData.csv` is copied or moved
 * to `public/defaultData.csv` (or adjust the PUBLIC_CSV_PATH below). If you prefer to keep
 * the file in /hooks only, create a small API route to expose it instead of fetching directly.
 */
const PUBLIC_CSV_PATH = "/defaultData.csv"; // Adjust if you relocate the file (e.g., /data/defaultData.csv)

async function getCachedData() {
    if (cachedData) return cachedData;
    try {
        // Always read from public copy (canonical). Works for both server (fetch) & client.
        const res = await fetch(PUBLIC_CSV_PATH, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to fetch ${PUBLIC_CSV_PATH}: ${res.status}`);
        const text = await res.text();
        cachedData = text.trim();
        return cachedData;
    } catch (err) {
        console.error('Failed to load defaultData.csv:', err);
        cachedData = '';
        return cachedData;
    }
}
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
    const [csvText, setCsvText] = useState<string>("");

    useEffect(() => {
        (async () => {
            const data = await getCachedData();
            setCsvText(data);
        })();
    }, []);

    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

    // Memoized CSV parsing to prevent unnecessary re-parsing
    const csvData = useMemo<Topic[]>(() => {
        const parsed = parseCsvData(csvText);
        return parsed.map((row, index) => ({
            ID: row.ID?.trim() || `generated-${index + 1}`, // Ensure unique ID
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