// components/App.tsx
"use client";
import React from 'react';
import StepCard from './StepCard';
import useArtemis from '../hooks/useArtemis';
import { Terminal, Rss, Image as ImageIcon, Send, UploadCloud, Sparkles, Wand2, PlusCircle, Clapperboard, Edit, CheckCircle, Loader2, BrainCircuit, Linkedin, Twitter, Instagram } from 'lucide-react';

const App: React.FC = () => {
  const csvRefreshTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const {
    csvText, setCsvText, handleLoadData, csvData, setCsvData, activeTopic, selectTopic,
    blogContent, generateBlog,
    // Visual workflow
    imagePrompt, setImagePrompt,
    imageScene, setImageScene,
    bodyLanguage, setBodyLanguage,
    visualDescriptions, selectedVisuals, handleVisualSelection, publishVisualsToSheet,
    generateVisual, visualLoadingMessage,
    // SEO
    seoData, generateSeo,
    // Social
    socialPosts, generateSocial,
    // CMS
    cmsPayload, publishToCms,
    // Reset handlers
    resetBlog, resetSeo, resetVisual, resetSocial, resetCms,
    // Sanity asset reference
    sanityAssetRef, setSanityAssetRef,
    workflowState,
    setWorkflowState,
    // Loading states
    isLoadingBlog, isLoadingVisual, isLoadingSocial, isLoadingCms, isLoadingSeo, isLoadingTopicIdeas,
    // Topic
    topicKeyword, setTopicKeyword, topicIdeas, setTopicIdeas, amplifyTopic, addIdeaToCsv,
  } = useArtemis();

  return (
    <div className="bg-brand-charcoal text-brand-slate min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-widest uppercase bg-brand-gradient bg-clip-text text-transparent"
            style={{
              WebkitBackgroundClip: 'text',
            }}
          >
            A R T E M I S
          </h1>
          <p className="text-lg mt-2 font-light tracking-wider">Automated Real-Time Engagement & Marketing Intelligence System</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CONTROL PANEL (LEFT) --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-neon-magenta/50 bg-slate-800/50 rounded-lg p-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold text-neon-magenta text-lg flex items-center"><Sparkles className="mr-2" size={20}/>Topic Amplifier ✨</h3>
                 <button
                   onClick={() => { setTopicKeyword(''); setTopicIdeas([]); }}
                   className="text-sm text-gray-400 hover:text-white"
                 >Clear</button>
               </div>
               <p className="text-sm text-slate-400 mb-3">Enter a keyword to brainstorm new topics.</p>
               <div className="flex space-x-2">
                <input type="text" placeholder="e.g., 'Excel automation'" value={topicKeyword} onChange={(e) => setTopicKeyword(e.target.value)} className="flex-grow bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-neon-magenta" />
                 <button onClick={() => amplifyTopic(topicKeyword)} disabled={isLoadingTopicIdeas} className="bg-neon-magenta hover:opacity-80 text-white font-bold p-2 rounded-lg disabled:bg-slate-600"> {isLoadingTopicIdeas ? <Loader2 className="animate-spin"/> : <Wand2/>} </button>
               </div>
               {isLoadingTopicIdeas && <div className="text-center p-4 text-sm">Amplifying ideas...</div>}
               {topicIdeas.length > 0 && <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">{topicIdeas.map((idea, i) => <div key={i} className="bg-slate-700/50 p-3 rounded-md"><p className="font-bold text-white">{idea.TITLE}</p><button onClick={() => addIdeaToCsv(idea)} className="text-neon-cyan hover:opacity-80 text-xs font-bold mt-2 flex items-center space-x-1"><PlusCircle size={14}/><span>Add to Data List</span></button></div>)}</div>}
            </div>

            <div className="border border-brand-slate-dark bg-slate-800/50 rounded-lg p-4">
               <h3 className="font-bold text-neon-cyan text-lg mb-2">1. Load Data</h3>
               <textarea
                 className="w-full h-48 bg-gray-900 border border-slate-600 rounded-md p-2 text-xs font-mono"
                 value={csvText}
                 onChange={e => {
                   setCsvText(e.target.value);
                   if (csvRefreshTimeout.current) clearTimeout(csvRefreshTimeout.current);
                   csvRefreshTimeout.current = setTimeout(() => {
                     handleLoadData();
                <button
                  type="button"
                  className="w-full font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 bg-sky-200 hover:bg-sky-300 text-brand-charcoal border border-sky-400"
                  onClick={() => {
                    setCsvText('ID,TITLE,CONTENT,VISUAL');
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
                  <Clapperboard size={18} />
                  <span>Reset</span>
                </button>
                   }, 500);
                 }}
                 onBlur={() => {
                   handleLoadData();
                 }}
               />
               <div className="mt-2">
                 <button
                   type="button"
           className="w-full font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 rainbow-hover-btn"
           style={{
             color: '#222',
           }}
                   onClick={() => {
                     document.getElementById('csv-file-input')?.click();
                   }}
                 >
                   <UploadCloud size={18} />
                   <span>Load CSV Data</span>
                 </button>
                 <input
                   id="csv-file-input"
                   type="file"
                   accept=".csv,text/csv"
                   style={{ display: 'none' }}
                   onChange={e => {
                     const file = e.target.files?.[0];
                     if (!file) return;
                     const reader = new FileReader();
                     reader.onload = (event) => {
                       const text = event.target?.result;
                       if (typeof text === 'string') {
                         setCsvText(text);
                         handleLoadData();
                         setTimeout(() => handleLoadData(), 0);
                       }
                     };
                     reader.readAsText(file);
                     e.target.value = '';
                   }}
                 />
               </div>
            </div>
            <div className="border border-brand-slate-dark bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-bold text-neon-cyan text-lg mb-3">2. Select Active Topic</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">{csvData.map((topic) => <button key={topic.ID} onClick={() => { selectTopic(topic); if (!workflowState.topic) setWorkflowState((prev: any) => ({ ...prev, topic: true })); }} className={`w-full text-left p-3 rounded-md transition-all duration-200 ${activeTopic?.ID === topic.ID ? 'bg-neon-cyan/20 border-neon-cyan ring-2 ring-neon-cyan' : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600'} border`}><p className="font-bold text-white">{topic.TITLE}</p><p className="text-xs text-slate-400 mt-1 truncate">{topic.CONTENT}</p></button>)}</div>
            </div>
          </div>

          {/* --- GENERATION STAGES (RIGHT) --- */}
          <div className="lg:col-span-2 space-y-8">
            <StepCard
              onReset={resetBlog}
              step={{
                title: "Generate Blog Post",
                icon: <Rss className="text-neon-cyan" />,
                isUnlocked: workflowState.topic,
                isComplete: workflowState.blog,
                children: (
                  <>
                    {!blogContent && (
                      <button
                        onClick={() => generateBlog(activeTopic)}
                        disabled={isLoadingBlog}
                        className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"
                      >
                        {isLoadingBlog ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE BLOG</span>
                      </button>
                    )}
                    {isLoadingBlog && <div className="text-center p-4">The Siren is contemplating...</div>}
                    {blogContent && (
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none bg-gray-900/50 p-4 rounded-md border border-brand-slate-dark">
                        <pre className="whitespace-pre-wrap font-sans">{blogContent}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
            {workflowState.blog && (
              <div className="border border-neon-magenta/50 bg-slate-900/30 rounded-lg p-1 space-y-6">
                <h3 className="text-center font-bold text-neon-magenta text-xl mt-4 flex items-center justify-center">
                  <Sparkles className="mr-2" size={22} />Enhancement Suite
                </h3>
                <StepCard
                  onReset={resetSeo}
                  step={{
                    title: "✨ SEO Suite",
                    icon: <Sparkles className="text-neon-cyan" />,
                    isUnlocked: workflowState.blog,
                    isComplete: workflowState.seo,
                    children: (
                      <>
                        {!seoData && (
                          <button
                            onClick={() => generateSeo(activeTopic)}
                            disabled={isLoadingSeo}
                            className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"
                          >
                            {isLoadingSeo ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE SEO</span>
                          </button>
                        )}
                        {isLoadingSeo && <div className="text-center p-4">Optimizing for the net...</div>}
                        {seoData && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-bold text-neon-magenta mb-2">Meta Description</h4>
                              <p className="text-sm bg-gray-900/50 p-3 rounded-md border border-brand-slate-dark">
                                {seoData.metaDescription}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-bold text-neon-magenta mb-2">Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {seoData.keywords.map(k => (
                                  <span key={k} className="bg-cyan-900/70 text-neon-cyan text-xs font-medium px-2.5 py-1 rounded-full">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ),
                  }}
                />
              </div>
            )}
            <StepCard
              onReset={resetVisual}
              step={{
                title: "Generate Visual",
                icon: <ImageIcon className="text-neon-cyan" />,
                isUnlocked: workflowState.blog,
                isComplete: workflowState.visual,
                children: (
                  <>
                    {!visualDescriptions.length && (
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Theme"
                          value={imagePrompt}
                          onChange={e => setImagePrompt(e.target.value)}
                          className="w-full bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-neon-magenta"
                        />
                        <input
                          type="text"
                          placeholder="Scene"
                          value={imageScene}
                          onChange={e => setImageScene(e.target.value)}
                          className="w-full bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-neon-magenta"
                        />
                        <input
                          type="text"
                          placeholder="Body Language"
                          value={bodyLanguage}
                          onChange={e => setBodyLanguage(e.target.value)}
                          className="w-full bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-neon-magenta"
                        />
                        <button
                          onClick={() => generateVisual(imagePrompt, imageScene, bodyLanguage)}
                          disabled={isLoadingVisual}
                          className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"
                        >
                          {isLoadingVisual ? <Loader2 className="animate-spin" /> : <Terminal />}
                          <span>GENERATE DESCRIPTIONS</span>
                        </button>
                      </div>
                    )}
                    {isLoadingVisual && (
                      <div className="text-center p-4 flex flex-col items-center space-y-2">
                        <BrainCircuit className="text-neon-magenta animate-pulse" size={24}/>
                        <span>{visualLoadingMessage}</span>
                      </div>
                    )}
                    {visualDescriptions.length > 0 && (
                      <div className="space-y-4">
                        {visualDescriptions.map((desc, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedVisuals.has(idx)}
                              onChange={() => handleVisualSelection(idx)}
                              className="mt-1"
                            />
                            <div className="bg-gray-900/50 p-3 rounded-md border border-brand-slate-dark w-full">
                              <p className="font-bold text-white">{desc["Image Name"]}</p>
                              <p className="text-sm text-slate-300">{desc["Caption Plan"]}</p>
                              <p className="text-xs text-slate-400">Audience: {desc["Target Audience"]}</p>
                              <p className="text-xs text-slate-400">Keywords: {desc["Keywords"]}</p>
                              <p className="text-xs text-slate-400">Platform: {desc["Platform"]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ),
              }}
            />
            <StepCard
              onReset={resetCms}
              step={{
                title: "Publish to CMS",
                icon: <UploadCloud className="text-neon-cyan" />,
                isUnlocked: workflowState.visual,
                isComplete: workflowState.cms,
                children: (
                  <>
                    {!cmsPayload && (
                      <div className="space-y-4">
                        <button
                          onClick={async () => {
                            // First send selected visuals to Google Sheets
                            await publishVisualsToSheet();
                            // Then publish content to CMS with only the blog content
                            await publishToCms({ post: { content: blogContent } });
                          }}
                          disabled={isLoadingCms}
                          className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"
                        >
                          {isLoadingCms ? <Loader2 className="animate-spin" /> : <Terminal />} <span>PUBLISH TO CMS</span>
                        </button>
                      </div>
                    )}
                    {isLoadingCms && <div className="text-center p-4">Publishing to the cosmos...</div>}
                    {cmsPayload && (
                      <div className="bg-gray-900/50 p-4 rounded-md border border-brand-slate-dark">
                        <h4 className="font-bold text-neon-magenta mb-2">CMS Payload</h4>
                        <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(cmsPayload, null, 2)}</pre>
                      </div>
                    )}
                  </>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;