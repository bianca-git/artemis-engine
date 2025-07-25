
// components/App.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import StepCard from "./StepCard";
import useArtemis from "../hooks/useArtemis";
import ThemeSwitcher from "./ThemeSwitcher";

const App = () => {
  const csvRefreshTimeout = useRef(null);
  const {
    csvText, setCsvText, handleLoadData, csvData, setCsvData, activeTopic, selectTopic,
    blogContent, generateBlog,
    imagePrompt, setImagePrompt,
    imageScene, setImageScene,
    bodyLanguage, setBodyLanguage,
    visualDescriptions, selectedVisuals, handleVisualSelection, publishVisualsToSheet,
    generateVisual, visualLoadingMessage,
    seoData, generateSeo,
    socialPosts, generateSocial,
    cmsPayload, publishToCms,
    resetBlog, resetSeo, resetVisual, resetSocial, resetCms,
    sanityAssetRef, setSanityAssetRef,
    workflowState,
    setWorkflowState,
    isLoadingBlog, isLoadingVisual, isLoadingSocial, isLoadingCms, isLoadingSeo, isLoadingTopicIdeas,
    topicKeyword, setTopicKeyword, topicIdeas, setTopicIdeas, amplifyTopic, addIdeaToCsv,
  } = useArtemis();

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl normal-case">
            <h1 className="text-3xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 bg-clip-text text-transparent animate-gradient-x">ARTEMIS</h1>
          </a>
        </div>
        <div className="flex-none">
          <ThemeSwitcher />
        </div>
      </div>

      <main className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-8">
          <section>
            <div className="card w-full bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h2 className="card-title">Topic Amplifier</h2>
                {topicKeyword.length > 0 || topicIdeas.length > 0 ? (
                  <button className="btn btn-error btn-sm mb-2 w-fit" onClick={() => { setTopicKeyword(""); setTopicIdeas([]); }}>Clear</button>
                ) : null}
                <p>Enter a keyword to brainstorm new topics.</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g., 'Excel automation'"
                    value={topicKeyword}
                    onChange={e => setTopicKeyword(e.target.value)}
                    className="input input-bordered w-full"
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => amplifyTopic(topicKeyword)} disabled={isLoadingTopicIdeas}>
                    Amplify
                  </button>
                </div>
                {isLoadingTopicIdeas && <div className="alert alert-info">Amplifying ideas...</div>}
                {topicIdeas.length > 0 && (
                  <ul className="menu bg-base-200 rounded-box">
                    {topicIdeas.map((idea, i) => (
                      <li key={i}>
                        <span className="font-bold">{idea.TITLE}</span>
                        <button className="btn btn-accent btn-xs ml-2" onClick={() => addIdeaToCsv(idea)}>Add to Data List</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="card w-full bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h2 className="card-title">1. Load Data</h2>
                {csvText.length > 0 || csvData.length > 0 ? (
                  <button
                    type="button"
                    className="btn btn-warning btn-sm mb-2 w-fit"
                    onClick={() => {
                      setCsvText("ID,TITLE,CONTENT,VISUAL");
                      setCsvData([]);
                      selectTopic(null);
                      setWorkflowState({
                        topic: false,
                        blog: false,
                        visual: false,
                        seo: false,
                        social: false,
                        cms: false,
                      });
                    }}
                  >
                    Reset
                  </button>
                ) : null}
                <textarea
                  className="textarea textarea-bordered w-full h-32 mb-2"
                  value={csvText}
                  onChange={e => {
                    setCsvText(e.target.value);
                    if (csvRefreshTimeout.current) clearTimeout(csvRefreshTimeout.current);
                    csvRefreshTimeout.current = setTimeout(() => {
                      handleLoadData();
                    }, 500);
                  }}
                  onBlur={() => {
                    handleLoadData();
                  }}
                />
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => {
                      document.getElementById("csv-file-input")?.click();
                    }}
                  >
                    Load CSV Data
                  </button>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = event => {
                        const text = event.target?.result;
                        if (typeof text === "string") {
                          setCsvText(text);
                          handleLoadData();
                          setTimeout(() => handleLoadData(), 0);
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="card w-full bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h2 className="card-title">2. Select Active Topic</h2>
                <ul className="menu bg-base-200 rounded-box">
                  {csvData.map(topic => (
                    <li key={topic.ID}>
                      <button
                        className={`btn btn-outline w-full text-left ${activeTopic?.ID === topic.ID ? "btn-primary" : ""}`}
                        onClick={() => {
                          selectTopic(topic);
                          if (!workflowState.topic) setWorkflowState(prev => ({ ...prev, topic: true }));
                        }}
                      >
                        <span className="font-bold">{topic.TITLE}</span>
                        <span className="ml-2">{topic.CONTENT}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Other generation sections below selections on the left */}
          <section>
            <StepCard
              onReset={resetSeo}
              step={{
                title: "Generate SEO",
                isUnlocked: workflowState.topic,
                isComplete: workflowState.seo,
                children: (
                  <>
                    {!seoData && (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => generateSeo(activeTopic)}
                        disabled={isLoadingSeo}
                      >
                        GENERATE SEO
                      </button>
                    )}
                    {isLoadingSeo && <div className="alert alert-info">Generating SEO...</div>}
                    {seoData && (
                      <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                        <pre>{JSON.stringify(seoData, null, 2)}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
          </section>

          <section>
            <StepCard
              onReset={resetSocial}
              step={{
                title: "Generate Social Posts",
                isUnlocked: workflowState.topic,
                isComplete: workflowState.social,
                children: (
                  <>
                    {!socialPosts && (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => generateSocial(activeTopic?.TITLE ?? "")}
                        disabled={isLoadingSocial}
                      >
                        GENERATE SOCIAL
                      </button>
                    )}
                    {isLoadingSocial && <div className="alert alert-info">Generating Social Posts...</div>}
                    {socialPosts && (
                      <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                        <pre>{JSON.stringify(socialPosts, null, 2)}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
          </section>

          <section>
            <StepCard
              onReset={resetVisual}
              step={{
                title: "Generate Visual",
                isUnlocked: workflowState.topic,
                isComplete: workflowState.visual,
                children: (
                  <>
                    {!visualDescriptions && (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => generateVisual(activeTopic?.TITLE ?? "", imageScene, bodyLanguage)}
                        disabled={isLoadingVisual}
                      >
                        GENERATE VISUAL
                      </button>
                    )}
                    {isLoadingVisual && <div className="alert alert-info">Generating Visual...</div>}
                    {visualDescriptions && (
                      <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                        <pre>{JSON.stringify(visualDescriptions, null, 2)}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
          </section>

          <section>
            <StepCard
              onReset={resetCms}
              step={{
                title: "Publish to CMS",
                isUnlocked: workflowState.blog || workflowState.visual || workflowState.social || workflowState.seo,
                isComplete: workflowState.cms,
                children: (
                  <>
                    {!cmsPayload && (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => publishToCms(activeTopic, blogContent, seoData, socialPosts, visualDescriptions, sanityAssetRef)}
                        disabled={isLoadingCms}
                      >
                        PUBLISH TO CMS
                      </button>
                    )}
                    {isLoadingCms && <div className="alert alert-info">Publishing to CMS...</div>}
                    {cmsPayload && (
                      <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                        <pre>{JSON.stringify(cmsPayload, null, 2)}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
          </section>

        </div>

        {/* Right Column - Blog Creation - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <StepCard
              onReset={resetBlog}
              step={{
                title: "Generate Blog Post",
                isUnlocked: workflowState.topic,
                isComplete: workflowState.blog,
                children: (
                  <>
                    {!blogContent && (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => generateBlog(activeTopic)}
                        disabled={isLoadingBlog}
                      >
                        GENERATE BLOG
                      </button>
                    )}
                    {isLoadingBlog && <div className="alert alert-info">The Siren is contemplating...</div>}
                    {blogContent && (
                      <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300 whitespace-pre-wrap">
                        <pre>{blogContent}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;


