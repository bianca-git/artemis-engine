// components/App.tsx
"use client";
import React, { useRef } from "react";
import useArtemis from "../hooks/useArtemis";
import ThemeSwitcher from "./ThemeSwitcher";
import StepCard from "./StepCard";
import TopicAmplifier from "./TopicAmplifier";
import LoadDataSection from "./LoadDataSection";
import SelectTopicSection from "./SelectTopicSection";
import GenerationSteps from "./GenerationSteps";
import BlogSection from "./BlogSection";

const App = () => {
  const csvRefreshTimeout = useRef(null);
  const artemis = useArtemis();

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="navbar bg-base-100 shadow-lg min-w-full">
        <div className="max-w-7xl mx-auto flex min-w-7xl justify-between items-center px-4">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl normal-case">
              <h1 className="text-3xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 bg-clip-text text-transparent animate-gradient-x">ARTEMIS</h1>
            </a>
          </div>
          <div className="flex-none">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
      <main className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-7xl max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-8">
          <TopicAmplifier {...artemis} />
          <LoadDataSection {...artemis} csvRefreshTimeout={csvRefreshTimeout} />
          <SelectTopicSection {...artemis} />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <BlogSection {...artemis} />
          <GenerationSteps {...artemis} />
        </div>
      </main>
    </div>
  );
};

export default App;


