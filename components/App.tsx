// components/App.tsx
"use client";
import React, { useRef, useMemo } from "react";
import useArtemis from "../hooks/useArtemis";
import ThemeSwitcher from "./ThemeSwitcher";
import TopicWorkflowSection from "./TopicWorkflowSection";
import GenerationSteps from "./GenerationSteps";
import { ErrorBoundary } from "./ErrorBoundary";


/**
 * Optimized main App component with error boundary and memoized props
 */
const App = () => {
  const csvRefreshTimeout = useRef(null);
  const artemis = useArtemis();

  // Memoize TopicWorkflowSection props to prevent unnecessary re-renders
  const topicWorkflowProps = useMemo(() => ({
    topicKeyword: artemis.topicKeyword,
    setTopicKeyword: artemis.setTopicKeyword,
    topicIdeas: artemis.topicIdeas,
    setTopicIdeas: artemis.setTopicIdeas,
    amplifyTopic: artemis.amplifyTopic,
    isLoadingTopicIdeas: artemis.isLoadingTopicIdeas,
    addIdeaToCsv: artemis.addIdeaToCsv,
    csvText: artemis.csvText,
    setCsvText: artemis.setCsvText,
    csvData: artemis.csvData,
    setCsvData: artemis.setCsvData,
    selectTopic: artemis.selectTopic,
    activeTopic: artemis.activeTopic,
    workflowState: artemis.workflowState,
    setWorkflowState: artemis.setWorkflowState,
    handleLoadData: artemis.handleLoadData,
    csvRefreshTimeout,
  resetBlog: artemis.resetBlog,
  resetSeo: artemis.resetSeo,
  resetVisual: artemis.resetVisual,
  resetSocial: artemis.resetSocial,
  resetCms: artemis.resetCms,
  }), [artemis, csvRefreshTimeout]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-base-200 text-base-content">
        <div className="navbar bg-base-100 shadow-lg w-full">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:gap-4 justify-between items-start sm:items-center px-4">
            <div className="flex-1 w-full">
              <a className="btn btn-ghost px-0 normal-case hover:bg-transparent">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 bg-clip-text text-transparent animate-gradient-x break-words">ARTEMIS</h1>
              </a>
            </div>
            <div className="flex-none w-full sm:w-auto">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        <main className="px-4 py-6 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-7xl mx-auto">
          <div className="lg:col-span-1 order-1">
            <TopicWorkflowSection {...topicWorkflowProps} />
          </div>
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2">
            <GenerationSteps {...artemis} />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
