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
1,"Midnight Mayhem: How PowerPoint Became Your Digital Torturer","Stop blaming insomnia and start hacking PowerPoint's chaos with ruthless shortcuts and savage slide control.","A neon-lit, dystopian cityscape with a shadowy Cyberpunk Diva chained to a giant, glitching PowerPoint logo."
2,"Slide Slavery: Breaking Free from PowerPoint's Clutches","Unshackle yourself from the endless slide grind with guerrilla tips that mock Microsoft's madness.","A cybernetic hand smashing glowing PowerPoint chains amidst a rain of neon code shards."
3,"Death by Bullet Points: PowerPoint's Silent Assassin","Learn to kill boring slides with savage visuals and savage wit, or face another digital funeral.","A cyberpunk diva wielding a plasma sword, slicing through dull bullet point zombies on a glowing stage."
4,"CTRL+Z Your Life: Undoing PowerPoint Nightmares Like a Pro","Master the dark art of undo to escape endless redo loops and reclaim your sanity.","A neon hologram of CTRL+Z buttons flashing in a rain-soaked alley with glitching digital ghosts."
5,"Design Disasters & Pixelated Nightmares: PowerPoint's Dirty Secrets Revealed","Expose the pixelated crimes lurking behind your slides and fix the mess without losing your mind.","A cyberpunk detective diva scanning corrupted slide fragments under flickering neon streetlights."
6,"Epic Fails and Slide Trolls: Surviving PowerPoint's Hidden Pitfalls","Arm yourself with snark, hacks, and secret weapons to face the slide demons stalking your presentations.","A neon battlefield with the Digital Diva fending off monstrous, glitchy PowerPoint trolls."
7,"Font Fiascos & Colour Catastrophes: The Real PowerPoint Horror Story","Reveal how typography tyranny and colour chaos ruin your slides—then annihilate them.","A digital diva masked like a cyber samurai striking down distorted, burning font glyphs."
8,"Night Owls Unite: PowerPoint Hacks for the Last-Watch Creatives","Because if you're pulling all-nighters flying solo, you need weapons sharp enough to cut through slide darkness.","A luminous cyberpunk owl perched on a glowing keyboard under a neon moon."
9,"From Zombie to Rockstar: Resurrect Your PowerPoint Mojo at 3 AM","Unlock radical tricks to turn dead-end deck drudgery into a midnight masterpiece.","A digital diva on a neon-lit stage, transforming a faceless zombie slide into a viral icon."
10,"Slide Showdown: Don't Let PowerPoint Win Your Soul","Declare war on monotonous presentations and slap some cyberpunk sass back into your workflow.","A neon-glowing duel scene between a diva with a holographic sword and a monstrous PowerPoint beast."`
    );

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