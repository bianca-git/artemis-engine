// components/App.tsx
"use client";
import React from 'react';
import StepCard from './StepCard';
import { useArtemis } from '../hooks/useArtemis';
import { Terminal, Rss, Image as ImageIcon, Send, UploadCloud, Sparkles, Wand2, PlusCircle, Clapperboard, Edit, CheckCircle, Loader2, BrainCircuit, Linkedin, Twitter, Instagram } from 'lucide-react';

const App: React.FC = () => {
  const {
    csvText, setCsvText, handleLoadData, csvData, activeTopic, selectTopic,
    blogContent, generateBlog,
    imageUrl, imagePrompt, generateVisual, visualLoadingMessage,
    seoData, generateSeo,
    socialPosts, generateSocial,
    sanityAssetRef, setSanityAssetRef, cmsPayload, publishToCms,
    workflowState,
    isLoadingBlog, isLoadingVisual, isLoadingSocial, isLoadingCms, isLoadingSeo, isLoadingTopicIdeas,
    topicKeyword, setTopicKeyword, topicIdeas, amplifyTopic, addIdeaToCsv,
  } = useArtemis();

  return (
    <div className="bg-brand-charcoal text-brand-slate min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff' }}>
            A R T E M I S
          </h1>
          <p className="text-neon-magenta text-lg mt-2 font-light tracking-wider">Automated Real-Time Engagement & Marketing Intelligence System</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CONTROL PANEL (LEFT) --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-neon-magenta/50 bg-slate-800/50 rounded-lg p-4">
               <h3 className="font-bold text-neon-magenta text-lg mb-2 flex items-center"><Sparkles className="mr-2" size={20}/>Topic Amplifier ✨</h3>
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
               <textarea className="w-full h-48 bg-gray-900 border border-slate-600 rounded-md p-2 text-xs font-mono" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
               <button onClick={handleLoadData} className="mt-2 w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2"><UploadCloud size={18} /><span>Load/Update CSV Data</span></button>
            </div>
            <div className="border border-brand-slate-dark bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-bold text-neon-cyan text-lg mb-3">2. Select Active Topic</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">{csvData.map((topic) => <button key={topic.ID} onClick={() => selectTopic(topic)} className={`w-full text-left p-3 rounded-md transition-all duration-200 ${activeTopic?.ID === topic.ID ? 'bg-neon-cyan/20 border-neon-cyan ring-2 ring-neon-cyan' : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600'} border`}><p className="font-bold text-white">{topic.TITLE}</p><p className="text-xs text-slate-400 mt-1 truncate">{topic.CONTENT}</p></button>)}</div>
            </div>
          </div>

          {/* --- GENERATION STAGES (RIGHT) --- */}
          <div className="lg:col-span-2 space-y-8">
            <StepCard step={{ title: "Generate Blog Post", icon: <Rss className="text-neon-cyan" />, isUnlocked: workflowState.topic, isComplete: workflowState.blog, children:
              <>
                {!blogContent && <button onClick={() => generateBlog(activeTopic)} disabled={isLoadingBlog} className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingBlog ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE BLOG</span> </button>}
                {isLoadingBlog && <div className="text-center p-4">The Siren is contemplating...</div>}
                {blogContent && <div className="prose prose-invert prose-sm sm:prose-base max-w-none bg-gray-900/50 p-4 rounded-md border border-brand-slate-dark"><pre className="whitespace-pre-wrap font-sans">{blogContent}</pre></div>}
              </>
            }}/>
            
            {workflowState.blog && (<div className="border border-neon-magenta/50 bg-slate-900/30 rounded-lg p-1 space-y-6">
                <h3 className="text-center font-bold text-neon-magenta text-xl mt-4 flex items-center justify-center"><Sparkles className="mr-2" size={22}/>Enhancement Suite</h3>
                <StepCard step={{ title: "✨ SEO Suite", icon: <Sparkles className="text-neon-cyan" />, isUnlocked: workflowState.blog, isComplete: workflowState.seo, children:
                    <>
                        {!seoData && <button onClick={() => generateSeo(activeTopic)} disabled={isLoadingSeo} className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingSeo ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE SEO</span> </button>}
                        {isLoadingSeo && <div className="text-center p-4">Optimizing for the net...</div>}
                        {seoData && <div className="space-y-4"><div><h4 className="font-bold text-neon-magenta mb-2">Meta Description</h4><p className="text-sm bg-gray-900/50 p-3 rounded-md border border-brand-slate-dark">{seoData.metaDescription}</p></div><div><h4 className="font-bold text-neon-magenta mb-2">Keywords</h4><div className="flex flex-wrap gap-2">{seoData.keywords.map(k => <span key={k} className="bg-cyan-900/70 text-neon-cyan text-xs font-medium px-2.5 py-1 rounded-full">{k}</span>)}</div></div></div>}
                    </>
                }}/>
            </div>)}

            <StepCard step={{ title: "Generate Visual", icon: <ImageIcon className="text-neon-cyan" />, isUnlocked: workflowState.blog, isComplete: workflowState.visual, children:
              <>
                {!imageUrl && <button onClick={() => generateVisual(imagePrompt)} disabled={isLoadingVisual} className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingVisual ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE VISUAL</span> </button>}
                {isLoadingVisual && <div className="text-center p-4 flex flex-col items-center space-y-2"><BrainCircuit className="text-neon-magenta animate-pulse" size={24}/><span>{visualLoadingMessage}</span></div>}
                {imagePrompt && <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-brand-slate-dark"><p className="text-sm font-bold text-neon-magenta mb-2">Final Image Prompt:</p><p className="text-xs font-mono">{imagePrompt}</p></div>}
                {imageUrl && <div className="mt-4"><img src={imageUrl} alt="Generated visual" className="rounded-lg border-2 border-neon-magenta shadow-lg shadow-neon-magenta/20 w-full" /></div>}
              </>
            }}/>

            <StepCard step={{ title: "Generate Social Posts", icon: <Send className="text-neon-cyan" />, isUnlocked: workflowState.visual, isComplete: workflowState.social, children:
               <>
                {!socialPosts && <button onClick={() => generateSocial(blogContent)} disabled={isLoadingSocial} className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingSocial ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE SOCIAL</span> </button>}
                {isLoadingSocial && <div className="text-center p-4">Broadcasting to the net...</div>}
                {socialPosts && <div className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-md border border-brand-slate-dark"><h4 className="font-bold text-white flex items-center space-x-2"><Linkedin size={18} className="text-[#0077b5]"/><span>LinkedIn</span></h4><p className="text-sm mt-2 whitespace-pre-wrap">{socialPosts.linkedin}</p></div>
                    <div className="p-4 bg-gray-900/50 rounded-md border border-brand-slate-dark"><h4 className="font-bold text-white flex items-center space-x-2"><Twitter size={18} className="text-[#1DA1F2]"/><span>Twitter/X</span></h4><p className="text-sm mt-2 whitespace-pre-wrap">{socialPosts.twitter}</p></div>
                    <div className="p-4 bg-gray-900/50 rounded-md border border-brand-slate-dark"><h4 className="font-bold text-white flex items-center space-x-2"><Instagram size={18} className="text-[#E1306C]"/><span>Instagram</span></h4><p className="text-sm mt-2 whitespace-pre-wrap">{socialPosts.instagram}</p></div>
                </div>}
               </>
            }}/>
            
            <StepCard step={{ title: "Publish to CMS", icon: <UploadCloud className="text-neon-cyan" />, isUnlocked: workflowState.visual, isComplete: workflowState.cms, children:
              <>
                {!cmsPayload && <div className="space-y-4">
                    <div><label htmlFor="sanity-ref" className="block text-sm font-bold text-neon-magenta mb-2">Sanity Asset _ref ID</label><input type="text" id="sanity-ref" placeholder="image-a7e4b5e2f1d9c8c7b6a5...-1920x1080-jpg" value={sanityAssetRef} onChange={(e) => setSanityAssetRef(e.target.value)} className="w-full bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-neon-magenta"/></div>
                    <button onClick={publishToCms} disabled={!sanityAssetRef || isLoadingCms} className="w-full bg-neon-cyan hover:opacity-80 text-brand-charcoal font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingCms ? <Loader2 className="animate-spin" /> : <Terminal />} <span>PUBLISH TO CMS</span> </button>
                </div>}
                {cmsPayload && <div>
                    <p className="text-feedback-success font-bold mb-2 flex items-center space-x-2"><CheckCircle size={20}/><span>Payload ready for Sanity CMS.</span></p>
                    <pre className="w-full h-96 overflow-y-auto bg-gray-950 p-4 rounded-md border border-brand-slate-dark text-xs font-mono">{JSON.stringify(cmsPayload, null, 2)}</pre>
                </div>}
              </>
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;