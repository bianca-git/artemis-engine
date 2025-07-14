"use client";
import React from "react";
import {
    Terminal,
    Rss,
    Linkedin,
    Twitter,
    Instagram,
    UploadCloud,
    CheckCircle,
    Loader2,
    BrainCircuit,
    Wand2,
    PlusCircle,
    Send,
} from "lucide-react";
import StepCard from "./StepCard";
import { useArtemis } from "../hooks/useArtemis";

export default function App() {
    const {
        csvText,
        setCsvText,
        handleLoadData,
        handleClear,
        error,
        steps,
        activeStep,
        setActiveStep,
        handleRemoveStep,
        handleUpdateStep,
        handleAddStep,
    } = useArtemis();

    const isCsvEmpty = !csvText.trim();
    // Remove all references to 'loading' and 'result' as they are not defined
    // Remove all references to 'footer' as it is not defined

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100">
            <div className="w-full max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <BrainCircuit className="w-8 h-8 text-indigo-600" />
                    Artemis Engine
                </h1>
                <div className="mb-4 flex gap-2">
                    <textarea
                        className="w-full p-2 border rounded resize-y min-h-[120px]"
                        placeholder="Paste CSV data here..."
                        value={csvText}
                        onChange={e => setCsvText(e.target.value)}
                    />
                    <label className="flex flex-col items-center justify-center cursor-pointer px-4">
                        <UploadCloud className="w-6 h-6 text-gray-500" />
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                        />
                        <span className="text-xs text-gray-500">Upload</span>
                    </label>
                </div>
                <div className="mb-4 flex gap-2">
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                        onClick={handleLoadData}
                        disabled={isCsvEmpty}
                    >
                        <Send className="w-4 h-4" />
                        Load Data
                    </button>
                    <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                        onClick={handleClear}
                        disabled={!csvText.trim()}
                    >
                        <Wand2 className="w-4 h-4" />
                        Clear
                    </button>
                </div>
                {error && (
                    <div className="mb-4 text-red-600">{error}</div>
                )}
                {steps.length > 0 && (
                    <div className="space-y-4">
                        {steps.map((step, idx) => (
                            <StepCard
                                key={step.id ?? idx}
                                step={{
                                    ...step,
                                    isActive: idx === activeStep,
                                    onSelect: () => setActiveStep(idx),
                                    onRemove: () => handleRemoveStep(idx),
                                    onUpdate: (updated: any) => handleUpdateStep(idx, updated),
                                }}
                            />
                        ))}
                        <button
                            className="flex items-center gap-2 text-indigo-600 hover:underline"
                            onClick={handleAddStep}
                        >
                            <PlusCircle className="w-5 h-5" />
                            Add Step
                        </button>
                    </div>
                )}
            </div>
            <footer className="w-full max-w-3xl mx-auto mt-8 flex justify-between items-center text-xs text-gray-400">
                <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Powered by Artemis
                </span>
                <span className="flex gap-3">
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4" />
                    </a>
                    <a href="https://rss.com" target="_blank" rel="noopener noreferrer">
                        <Rss className="w-4 h-4" />
                    </a>
                </span>
            </footer>
        </main>
    );
}
