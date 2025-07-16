"use client";
import React from "react";
import {
    Database,
    Trash2,
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
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Artemis Engine
                    </h1>
                    <p className="text-lg text-gray-600">
                        Automated Real-Time Engagement & Marketing Intelligence System
                    </p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Control Panel (Left) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="simple-card p-6">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Topic Amplifier
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Enter a keyword to brainstorm new topics.
                            </p>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="e.g., 'Excel automation'"
                                    value={''}
                                    onChange={() => {}}
                                    className="simple-input flex-1"
                                />
                                <button className="simple-button">
                                    <Wand2 size={16}/>
                                </button>
                            </div>
                        </div>

                        <div className="simple-card p-6">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                Load Data
                            </h3>
                                <span className="rainbow-highlight">1. Load Data</span>
                            </h3>
                            <textarea
                                className="sleek-input w-full h-48 text-sm font-mono resize-none"
                                value={csvText}
                                onChange={e => setCsvText(e.target.value)}
                                placeholder="Paste your CSV data here..."
                            />
                            <button 
                                className="sleek-button mt-6 w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleLoadData}
                                disabled={isCsvEmpty}
                            >
                                <UploadCloud size={20} />
                                <span>Load/Update CSV Data</span>
                            </button>
                        </div>

                        <div className="sleek-card p-6">
                            <h3 className="text-2xl font-bold mb-4">
                                <span className="rainbow-highlight">2. Select Active Topic</span>
                            </h3>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {/* Example topic buttons with rainbow effects */}
                                <button className="w-full text-left p-4 rounded-lg transition-all duration-300 bg-black/50 hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-pink-900/50 border-2 border-purple-500/50 hover:border-pink-400 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50">
                                    <span className="text-2xl mr-3">📊</span>
                                    <span className="rainbow-text">Excel Automation Mastery</span>
                                </button>
                                <button className="w-full text-left p-4 rounded-lg transition-all duration-300 bg-black/50 hover:bg-gradient-to-r hover:from-cyan-900/50 hover:to-blue-900/50 border-2 border-cyan-500/50 hover:border-blue-400 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50">
                                    <span className="text-2xl mr-3">�</span>
                                    <span className="rainbow-text">Project Management Revolution</span>
                                </button>
                                <button className="w-full text-left p-4 rounded-lg transition-all duration-300 bg-black/50 hover:bg-gradient-to-r hover:from-green-900/50 hover:to-emerald-900/50 border-2 border-green-500/50 hover:border-emerald-400 text-white font-medium hover:shadow-lg hover:shadow-green-500/50">
                                    <span className="text-2xl mr-3">⚡</span>
                                    <span className="rainbow-text">AI-Powered Workflows</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Workspace (Right) */}
                    <div className="lg:col-span-2">
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
                                    className="simple-button flex items-center gap-2 mx-auto"
                                    onClick={handleAddStep}
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Add Step</span>
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                                <p className="font-semibold text-red-800 mb-1">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {steps.length === 0 && (
                            <div className="text-center py-12">
                                <div className="simple-card p-8 max-w-md mx-auto">
                                    <div className="text-4xl mb-4">🚀</div>
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                        Ready to Start
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Load your CSV data and select a topic to begin.
                                    </p>
                                    <button
                                        className="simple-button flex items-center gap-2 mx-auto"
                                        onClick={handleAddStep}
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Add First Step</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <footer className="mt-8 simple-card p-4 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-gray-600" /> 
                        <span className="text-sm text-gray-600">Powered by Artemis</span>
                    </span>
                    <span className="flex gap-3">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <Linkedin className="w-4 h-4" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="https://rss.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <Rss className="w-4 h-4" />
                        </a>
                    </span>
                </footer>
            </div>
        </main>
    );
}
