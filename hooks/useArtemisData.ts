import { parseCsvData } from "../utils/helpers";
import { useState, useEffect } from "react";

// Types for better clarity
type Topic = {
    ID: string;
    TITLE: string;
    CONTENT: string;
    VISUAL: string;
    [key: string]: any;
};

export function useArtemisData() {
    // CSV and topic data management
    // State: csvText, csvData, activeTopic
    // Handlers: handleLoadData, selectTopic, addIdeaToCsv
    // ...implement logic here...
    const [csvText, setCsvText] = useState(
        `ID,TITLE,CONTENT,VISUAL
1,"Taming the Cerberus of Spreadsheets","- The three-headed beast of data entry: manual errors, formatting hell, and soul-crushing repetition.<br>- How conventional \"solutions\" like basic macros often create more problems.<br>- Introducing the \"Ghost-in-the-Sheet\" method: using advanced scripting and conditional automation to create a self-correcting, intelligent data entry system.<br>- A step-by-step guide to setting up the core logic.","a vast, glowing holographic spreadsheet whose grid is alive with pulsating data streams"
2,"Escaping the Labyrinth of Project Management Software","- The shared nightmare of bloated PM tools: endless notifications, conflicting \"single sources of truth,\" and the illusion of productivity.<br>- Why adding more integrations often makes the maze more complex.<br>- The \"Ariadne's Thread\" technique: a minimalist framework for centralizing tasks and communication, ruthlessly cutting out feature bloat.<br>- How to build a master dashboard that pulls only critical data, ignoring the noise.","an abstract labyrinth made of glowing purple circuit-board lines, cluttered with flickering, distracting software icons"`
    );

    const mapToTopic = (data: Record<string, string>[]): Topic[] =>
        data.map((row) => ({
            ID: row.ID || "",
            TITLE: row.TITLE || "",
            CONTENT: row.CONTENT || "",
            VISUAL: row.VISUAL || "",
            ...row,
        }));

    const [csvData, setCsvData] = useState<Topic[]>(() => mapToTopic(parseCsvData(csvText)));
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

    // --- Handlers ---
    const handleLoadData = () => {
        const data = parseCsvData(csvText);
        const mapped = mapToTopic(data);
        setCsvData(mapped);
        setActiveTopic(null);
    };

    const selectTopic = (topic: Topic) => {
        setActiveTopic(topic);
    };

    const addIdeaToCsv = (idea: any) => {
        const newCsvText = `${csvText}\n${idea.ID},"${idea.TITLE}","${idea.CONTENT}","${idea.VISUAL}"`;
        setCsvText(newCsvText);
        setCsvData(mapToTopic(parseCsvData(newCsvText)));
        handleLoadData();
    };

    useEffect(() => {
        handleLoadData();
    }, [csvText]);

    return {
        csvText, setCsvText, csvData, setCsvData, activeTopic, setActiveTopic,
        handleLoadData, selectTopic, addIdeaToCsv
    };
}