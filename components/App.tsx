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
    Sparkles,
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
        <main className="min-h-screen bg-[#111827] font-sans text-slate-300">
            <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
                <header className="mb-8 text-center">
                    <h1 className="text-5xl sm:text-6xl font-extrabold uppercase tracking-widest mb-2 artemis-title text-cyan-400 drop-shadow-[0_0_24px_#00FFFF]">Artemis</h1>
                    <p className="text-magenta-400 text-lg font-light tracking-wider">Automated Real-Time Engagement & Marketing Intelligence System</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Control Panel (Left) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-800/50 rounded-xl border border-magenta-400 p-4 shadow-lg">
                            <h3 className="font-bold text-magenta-400 text-lg mb-2 flex items-center"><Sparkles className="mr-2 text-magenta-400" size={20}/>Topic Amplifier ✨</h3>
                            <p className="text-sm text-slate-400 mb-3">Enter a keyword to brainstorm new topics.</p>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="e.g., 'Excel automation'"
                                    value={''}
                                    onChange={() => {}}
                                    className="flex-grow bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-magenta-400 focus:border-magenta-400 transition-all"
                                />
                                <button className="bg-magenta-400 hover:bg-pink-500 text-white font-bold p-2 rounded-lg transition-all transform hover:scale-105 flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    <Wand2/>
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 shadow-lg">
                            <h3 className="font-bold text-cyan-400 text-lg mb-2">1. Load Data</h3>
                            <textarea
                                className="w-full h-48 bg-gray-900 border border-slate-600 rounded-md p-2 text-xs font-mono focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                                value={csvText}
                                onChange={e => setCsvText(e.target.value)}
                            />
                            <button className="mt-2 w-full bg-cyan-400 hover:bg-cyan-300 text-[#111827] font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
                                onClick={handleLoadData}
                                disabled={isCsvEmpty}
                            >
                                <UploadCloud size={18} />
                                <span>Load/Update CSV Data</span>
                            </button>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 shadow-lg">
                            <h3 className="font-bold text-cyan-400 text-lg mb-3">2. Select Active Topic</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {/* Example topic buttons, replace with dynamic topics */}
                                <button className="w-full text-left p-3 rounded-md transition-all duration-200 bg-slate-700/50 hover:bg-cyan-400/20 border border-slate-600 text-white font-bold">
                                    Example Topic
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Workspace (Right) */}
                    <div className="lg:col-span-2 space-y-8">
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
                                    className="flex items-center gap-2 bg-cyan-400 text-[#111827] font-bold px-4 py-2 rounded-lg transition-all transform hover:scale-105 hover:bg-cyan-300"
                                    onClick={handleAddStep}
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Add Step
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 text-red-600">{error}</div>
                        )}
                    </div>
                </div>
                <footer className="w-full max-w-7xl mx-auto mt-8 flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Powered by Artemis
                    </span>
                    <span className="flex gap-3">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4 text-cyan-400 hover:text-magenta-400 transition" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <Twitter className="w-4 h-4 text-cyan-400 hover:text-magenta-400 transition" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-4 h-4 text-cyan-400 hover:text-magenta-400 transition" />
                        </a>
                        <a href="https://rss.com" target="_blank" rel="noopener noreferrer">
                            <Rss className="w-4 h-4 text-cyan-400 hover:text-magenta-400 transition" />
                        </a>
                    </span>
                </footer>
            </div>
        </main>
    );
}
