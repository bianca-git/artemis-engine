import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, Rss, Linkedin, Twitter, Instagram, Image as ImageIcon, Send, UploadCloud, CheckCircle, Loader2, BrainCircuit, Sparkles, Wand2, PlusCircle } from 'lucide-react';

// --- Helper Functions ---
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const calculateReadTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Standalone parsing function for better reliability
const parseCsvData = (text) => {
    if (!text) return [];
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      // Regex to handle basic CSV with quoted fields
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      return headers.reduce((obj, header, i) => {
        const rawValue = values[i] || '';
        // Remove quotes from the start and end of the string, and un-escape double quotes
        obj[header] = rawValue.startsWith('"') && rawValue.endsWith('"') 
            ? rawValue.slice(1, -1).replace(/""/g, '"') 
            : rawValue;
        return obj;
      }, {});
    });
    return data;
};


// --- Main App Component ---
export default function App() {
  // --- State Management ---
  const [csvText, setCsvText] = useState(
    `ID,TITLE,CONTENT,VISUAL\n1,"Taming the Cerberus of Spreadsheets","- The three-headed beast of data entry: manual errors, formatting hell, and soul-crushing repetition.<br>- How conventional ""solutions"" like basic macros often create more problems.<br>- Introducing the ""Ghost-in-the-Sheet"" method: using advanced scripting and conditional automation to create a self-correcting, intelligent data entry system.<br>- A step-by-step guide to setting up the core logic.","a vast, glowing holographic spreadsheet whose grid is alive with pulsating data streams"\n2,"Escaping the Labyrinth of Project Management Software","- The shared nightmare of bloated PM tools: endless notifications, conflicting ""single sources of truth,"" and the illusion of productivity.<br>- Why adding more integrations often makes the maze more complex.<br>- The ""Ariadne's Thread"" technique: a minimalist framework for centralizing tasks and communication, ruthlessly cutting out feature bloat.<br>- How to build a master dashboard that pulls only critical data, ignoring the noise.","an abstract labyrinth made of glowing purple circuit-board lines, cluttered with flickering, distracting software icons"`
  );

  const [csvData, setCsvData] = useState(() => parseCsvData(csvText));
  const [activeTopic, setActiveTopic] = useState(null);
  
  const initialWorkflowState = { topic: false, blog: false, visual: false, seo: false, social: false, cms: false };
  const [workflowState, setWorkflowState] = useState(initialWorkflowState);
  
  // Content States
  const [blogContent, setBlogContent] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [socialPosts, setSocialPosts] = useState(null);
  const [cmsPayload, setCmsPayload] = useState(null);
  const [sanityAssetRef, setSanityAssetRef] = useState('');
  const [seoData, setSeoData] = useState(null);
  const [topicIdeas, setTopicIdeas] = useState([]);
  const [topicKeyword, setTopicKeyword] = useState('');


  // Loading States
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [isLoadingVisual, setIsLoadingVisual] = useState(false);
  const [visualLoadingMessage, setVisualLoadingMessage] = useState('');
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const [isLoadingCms, setIsLoadingCms] = useState(false);
  const [isLoadingSeo, setIsLoadingSeo] = useState(false);
  const [isLoadingTopicIdeas, setIsLoadingTopicIdeas] = useState(false);


  // --- Handlers & Logic ---
  const resetGeneratedContent = () => {
      setBlogContent('');
      setImagePrompt('');
      setImageUrl('');
      setSocialPosts(null);
      setCmsPayload(null);
      setSanityAssetRef('');
      setSeoData(null);
  };

  const handleLoadData = () => {
    const data = parseCsvData(csvText);
    setCsvData(data);
    setActiveTopic(null);
    setWorkflowState(initialWorkflowState);
    resetGeneratedContent();
  };

  const selectTopic = (topic) => {
    setActiveTopic(topic);
    setWorkflowState({ ...initialWorkflowState, topic: true });
    resetGeneratedContent();
  };

  // --- NEW GEMINI FEATURES ---
  const amplifyTopic = async () => {
    if (!topicKeyword) return;
    setIsLoadingTopicIdeas(true);
    setTopicIdeas([]);
    
    const prompt = `You are the "Digital Diva: Cyberpunk Siren". Brainstorm 5 compelling blog post ideas based on the keyword: "${topicKeyword}". For each idea, provide a "TITLE", a "CONTENT" brief (as a single string with points separated by <br>), and a "VISUAL" description. Your persona is about debunking digital disasters with wit and expertise. Return the result as a valid JSON array of objects.`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            TITLE: { type: "STRING" },
                            CONTENT: { type: "STRING" },
                            VISUAL: { type: "STRING" }
                        },
                        required: ["TITLE", "CONTENT", "VISUAL"]
                    }
                }
            }
        };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
            setTopicIdeas(parsedJson);
        } else {
            console.error("Topic amplification failed:", result);
        }
    } catch (error) {
        console.error("Error calling Gemini API for topic ideas:", error);
    } finally {
        setIsLoadingTopicIdeas(false);
    }
  };

  // [FIXED] This function now updates both text and data states to prevent duplicate key errors.
  const addIdeaToCsv = (idea) => {
    // 1. Calculate new ID based on the current csvData state to ensure uniqueness
    const newId = csvData.length > 0 ? Math.max(...csvData.map(t => parseInt(t.ID) || 0)) + 1 : 1;
    
    // 2. Create the new topic object
    const newTopicObject = {
        ID: newId.toString(),
        TITLE: idea.TITLE,
        CONTENT: idea.CONTENT,
        VISUAL: idea.VISUAL
    };

    // 3. Create the new CSV row string from the object
    // Escape double quotes for CSV format
    const title = `"${newTopicObject.TITLE.replace(/"/g, '""')}"`;
    const content = `"${newTopicObject.CONTENT.replace(/"/g, '""')}"`;
    const visual = `"${newTopicObject.VISUAL.replace(/"/g, '""')}"`;
    const newRow = `\n${newTopicObject.ID},${title},${content},${visual}`;

    // 4. Update both states simultaneously to keep them in sync
    setCsvText(prev => prev + newRow);
    setCsvData(prev => [...prev, newTopicObject]);
  };

  const generateSeo = async () => {
    if (!blogContent) return;
    setIsLoadingSeo(true);
    setSeoData(null);
    const prompt = `Analyze the following blog post written by the "Digital Diva" and generate an SEO suite. Provide: 1. A list of 10-15 relevant SEO keywords (a mix of short-tail and long-tail). 2. A compelling, 160-character meta description in the Digital Diva's witty, authoritative voice. Return a valid JSON object with keys "keywords" (an array of strings) and "metaDescription" (a string). Blog Post: "${blogContent}"`;
    
     try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        keywords: { type: "ARRAY", items: { type: "STRING" } },
                        metaDescription: { type: "STRING" }
                    },
                    required: ["keywords", "metaDescription"]
                }
            }
        };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
            setSeoData(parsedJson);
            setWorkflowState(s => ({ ...s, seo: true }));
        } else {
            console.error("SEO generation failed:", result);
        }
    } catch (error) {
        console.error("Error calling Gemini API for SEO suite:", error);
    } finally {
        setIsLoadingSeo(false);
    }
  };


  // --- Core Generation Functions ---
  const generateBlog = async () => {
    if (!activeTopic) return;
    setIsLoadingBlog(true);
    setBlogContent('');

    const prompt = `Act as the "Digital Diva: Cyberpunk Siren" persona. Your tone is authoritative, analytical, and full of dry, incisive wit. Write a full blog post in Markdown format.

**Article Structure (Strict):**
1.  **Title:** Use the provided title: "${activeTopic.TITLE}"
2.  **Introduction:** Frame the problem with articulate, theatrical empathy. Address your audience as "my dear glitches" or "darlings."
3.  **Main Body:** Elaborate on the points from the brief: "${activeTopic.CONTENT.replace(/<br>/g, '\n')}". Present your solutions as potent, hard-won insights. Use clear subheadings and lists.
4.  **Conclusion:** Summarize the key insights and end with an expectant, authoritative call to action.`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            setBlogContent(result.candidates[0].content.parts[0].text);
            setWorkflowState(s => ({ ...s, blog: true }));
        } else {
            console.error("Blog generation failed:", result);
            setBlogContent("Error: Could not generate blog post. Check console for details.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        setBlogContent(`Error: API call failed. ${error.message}`);
    } finally {
        setIsLoadingBlog(false);
    }
  };
  
  const generateVisual = async () => {
    if (!activeTopic || !blogContent) return;
    setIsLoadingVisual(true);
    setImageUrl('');
    setImagePrompt('');

    try {
        setVisualLoadingMessage('Analyzing article for visual concepts...');
        const analysisPrompt = `Based on the following blog post, extract a short, descriptive list of the most important visual elements, objects, and actions. Focus on concrete nouns and dramatic concepts. Return a comma-separated list. Blog Post: "${blogContent}"`;
        let visualKeywords = '';
        const analysisPayload = { contents: [{ role: "user", parts: [{ text: analysisPrompt }] }] };
        const apiKey = "";
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const analysisResponse = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(analysisPayload) });
        const analysisResult = await analysisResponse.json();
        if (analysisResult.candidates && analysisResult.candidates[0]?.content?.parts[0]?.text) {
            visualKeywords = analysisResult.candidates[0].content.parts[0].text;
        }

        setVisualLoadingMessage('Synthesizing visual prompt...');
        const character = "the Digital Diva, a sassy femme tech expert with sharp green eyes and long dark hair with thick, glowing, fiber-optic rainbow streaks";
        const wardrobeOptions = ["wearing an asymmetrical top with glowing data streams and a stylish jacket", "wearing a sleek high-necked dress with glowing circuit patterns and gogo dancing boots", "wearing a hoodie with a holographic rainbow logo and headphones with glowing fiber-optic cables"];
        const selectedWardrobe = wardrobeOptions[Math.floor(Math.random() * wardrobeOptions.length)];
        const style = "Art Style: atmospheric digital illustration, modern vector elements, soft diffused glows, vibrant colored outlines, cinematic lighting.";
        const negativePrompts = "--no photo, realistic, 3d render, grainy, blurry, hard-edged shading";
        const prompt = `ultra-widescreen cinematic shot of ${character}, ${selectedWardrobe}. She is in a scene representing "${activeTopic.VISUAL}", and the scene must incorporate these key elements from the article: ${visualKeywords}. ${style} ${negativePrompts} --ar 16:9`;
        setImagePrompt(prompt);

        setVisualLoadingMessage('Rendering final image...');
        const imagePayload = { instances: [{ prompt: prompt }], parameters: { "sampleCount": 1 } };
        const imagenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const imageResponse = await fetch(imagenApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(imagePayload) });
        const imageResult = await imageResponse.json();

        if (imageResult.predictions && imageResult.predictions[0]?.bytesBase64Encoded) {
            setImageUrl(`data:image/png;base64,${imageResult.predictions[0].bytesBase64Encoded}`);
            setWorkflowState(s => ({ ...s, visual: true }));
        } else {
            console.error("Image generation failed:", imageResult);
            setImageUrl(`https://placehold.co/1920x1080/111827/ff00ff?text=Generation+Failed`);
        }
    } catch (error) {
        console.error("Error during visual generation pipeline:", error);
        setImageUrl(`https://placehold.co/1920x1080/111827/ff00ff?text=API+Error`);
    } finally {
        setIsLoadingVisual(false);
        setVisualLoadingMessage('');
    }
  };
  
  const generateSocial = async () => {
      if (!activeTopic) return;
      setIsLoadingSocial(true);
      setSocialPosts(null);
      const prompt = `Act as the "Digital Diva: Cyberpunk Siren" social media voice. Generate a JSON object of promotional posts for a blog article titled "${activeTopic.TITLE}". LinkedIn: Professional, incisive, focus on the strategic inefficiency solved, 3-5 hashtags. Twitter/X: Short, witty, provocative, ask a rhetorical question, 2-3 hashtags. Instagram: Visually-focused caption for the hero image, start with a hook, end with a call to action, 5-7 hashtags.`;
      try {
          const payload = {
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: { type: "OBJECT", properties: { linkedin: { type: "STRING" }, twitter: { type: "STRING" }, instagram: { type: "STRING" } }, required: ["linkedin", "twitter", "instagram"] }
              }
          };
          const apiKey = "";
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
          const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const result = await response.json();
          if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
              setSocialPosts(JSON.parse(result.candidates[0].content.parts[0].text));
              setWorkflowState(s => ({ ...s, social: true }));
          } else {
              console.error("Social generation failed:", result);
          }
      } catch (error) {
          console.error("Error calling Gemini API for social posts:", error);
      } finally {
          setIsLoadingSocial(false);
      }
  };

  const publishToCms = () => {
      if (!blogContent || !imageUrl || !sanityAssetRef) return;
      setIsLoadingCms(true);
      
      const blocks = blogContent.split('\n').filter(line => line.trim() !== '').map(line => {
          line = line.trim(); let style = 'normal'; let listItem;
          if (line.startsWith('### ')) { style = 'h3'; line = line.substring(4); } 
          else if (line.startsWith('## ')) { style = 'h2'; line = line.substring(3); } 
          else if (line.startsWith('# ')) { style = 'h1'; line = line.substring(2); } 
          else if (line.match(/^\s*-\s/)) { listItem = 'bullet'; line = line.replace(/^\s*-\s/, ''); } 
          else if (line.match(/^\s*\d+\.\s/)) { listItem = 'number'; line = line.replace(/^\s*\d+\.\s/, ''); }
          const block = { _type: 'block', style: style, _key: Math.random().toString(36).substring(2, 10), children: [{ _type: 'span', _key: Math.random().toString(36).substring(2, 10), text: line, marks: [] }], markDefs: [] };
          if(listItem) { block.listItem = listItem; block.level = 1; }
          return block;
      });
      const excerpt = (blogContent.split('\n').find(p => p.trim() && !p.startsWith('#')) || '').substring(0, 200) + '...';
      const payload = { _type: 'post', author: { _ref: "e8d9e267-3a76-4ae9-a199-1a4cb9018f32", _type: "reference" }, body: blocks, mainImage: { _type: 'image', asset: { _type: 'reference', _ref: sanityAssetRef } }, publishedAt: new Date().toISOString(), slug: { _type: 'slug', current: slugify(activeTopic.TITLE) }, title: activeTopic.TITLE, excerpt: excerpt, readTime: calculateReadTime(blogContent) };
      if (seoData) {
          payload.seo = seoData;
      }
      setCmsPayload(payload);
      setIsLoadingCms(false);
      setWorkflowState(s => ({ ...s, cms: true }));
  };
  
  // --- Render Components ---
  const StepCard = ({ title, icon, isUnlocked, isComplete, children }) => (
    <div className={`border border-slate-700 bg-slate-800/50 rounded-lg transition-all duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-lg font-bold text-cyan-300 tracking-wider">{title}</h2>
        </div>
        {isComplete && <CheckCircle className="text-lime-400" size={20} />}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-slate-300 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff' }}>
            A R T E M I S
          </h1>
          <p className="text-magenta-400 text-lg mt-2 font-light tracking-wider">Automated Real-Time Engagement & Marketing Intelligence System</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- CONTROL PANEL (LEFT) --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* --- NEW: TOPIC AMPLIFIER --- */}
            <div className="border border-magenta-500/50 bg-slate-800/50 rounded-lg p-4">
               <h3 className="font-bold text-magenta-400 text-lg mb-2 flex items-center"><Sparkles className="mr-2 text-magenta-400" size={20}/>Topic Amplifier ✨</h3>
               <p className="text-sm text-slate-400 mb-3">Enter a keyword to brainstorm new topics.</p>
               <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="e.g., 'Excel automation'"
                    value={topicKeyword}
                    onChange={(e) => setTopicKeyword(e.target.value)}
                    className="flex-grow bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-magenta-500 focus:border-magenta-500"
                />
                 <button onClick={amplifyTopic} disabled={isLoadingTopicIdeas} className="bg-magenta-600 hover:bg-magenta-500 text-white font-bold p-2 rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                    {isLoadingTopicIdeas ? <Loader2 className="animate-spin"/> : <Wand2/>}
                 </button>
               </div>
               {isLoadingTopicIdeas && <div className="text-center p-4 text-sm">Amplifying ideas...</div>}
               {topicIdeas.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                    {topicIdeas.map((idea, i) => (
                        <div key={i} className="bg-slate-700/50 p-3 rounded-md">
                            <p className="font-bold text-white">{idea.TITLE}</p>
                            <button onClick={() => addIdeaToCsv(idea)} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-2 flex items-center space-x-1">
                                <PlusCircle size={14}/>
                                <span>Add to Data List</span>
                            </button>
                        </div>
                    ))}
                </div>
               )}
            </div>

            <div className="border border-slate-700 bg-slate-800/50 rounded-lg p-4">
               <h3 className="font-bold text-cyan-400 text-lg mb-2">1. Load Data</h3>
               <textarea
                className="w-full h-48 bg-gray-900 border border-slate-600 rounded-md p-2 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
               />
               <button onClick={handleLoadData} className="mt-2 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                 <UploadCloud size={18} />
                 <span>Load/Update CSV Data</span>
               </button>
            </div>
            <div className="border border-slate-700 bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-bold text-cyan-400 text-lg mb-3">2. Select Active Topic</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {csvData.map((topic, index) => (
                  <button key={topic.ID || index} onClick={() => selectTopic(topic)} className={`w-full text-left p-3 rounded-md transition-all duration-200 ${activeTopic?.TITLE === topic.TITLE ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400' : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600'} border`}>
                    <p className="font-bold text-white">{topic.TITLE}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">{topic.CONTENT}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- GENERATION STAGES (RIGHT) --- */}
          <div className="lg:col-span-2 space-y-8">
            <StepCard title="Generate Blog Post" icon={<Rss className="text-cyan-400" />} isUnlocked={workflowState.topic} isComplete={workflowState.blog}>
              {!blogContent && <button onClick={generateBlog} disabled={isLoadingBlog} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingBlog ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE BLOG</span> </button>}
              {isLoadingBlog && <div className="text-center p-4">The Siren is contemplating...</div>}
              {blogContent && <div className="prose prose-invert prose-sm sm:prose-base max-w-none bg-gray-900/50 p-4 rounded-md border border-slate-700"><pre className="whitespace-pre-wrap font-sans">{blogContent}</pre></div>}
            </StepCard>

            {/* --- NEW: SEO SUITE --- */}
            <StepCard title="✨ SEO Suite" icon={<Sparkles className="text-cyan-400" />} isUnlocked={workflowState.blog} isComplete={workflowState.seo}>
              {!seoData && <button onClick={generateSeo} disabled={isLoadingSeo} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingSeo ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE SEO SUITE</span> </button>}
              {isLoadingSeo && <div className="text-center p-4">Optimizing for the net...</div>}
              {seoData && <div className="space-y-4">
                  <div>
                      <h4 className="font-bold text-magenta-400 mb-2">Meta Description</h4>
                      <p className="text-sm bg-gray-900/50 p-3 rounded-md border border-slate-700">{seoData.metaDescription}</p>
                  </div>
                  <div>
                      <h4 className="font-bold text-magenta-400 mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">{seoData.keywords.map(k => <span key={k} className="bg-cyan-900/70 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full">{k}</span>)}</div>
                  </div>
              </div>}
            </StepCard>

            <StepCard title="Generate Visual" icon={<ImageIcon className="text-cyan-400" />} isUnlocked={workflowState.blog} isComplete={workflowState.visual}>
              {!imageUrl && <button onClick={generateVisual} disabled={isLoadingVisual} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingVisual ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE VISUAL</span> </button>}
              {isLoadingVisual && <div className="text-center p-4 flex flex-col items-center space-y-2"><BrainCircuit className="text-magenta-400 animate-pulse" size={24}/><span>{visualLoadingMessage}</span></div>}
              {imagePrompt && <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-slate-700"><p className="text-sm font-bold text-magenta-400 mb-2">Final Image Prompt:</p><p className="text-xs font-mono">{imagePrompt}</p></div>}
              {imageUrl && <div className="mt-4"><img src={imageUrl} alt="Generated visual" className="rounded-lg border-2 border-magenta-500 shadow-lg shadow-magenta-500/20 w-full" /></div>}
            </StepCard>

            <StepCard title="Generate Social Posts" icon={<Send className="text-cyan-400" />} isUnlocked={workflowState.visual} isComplete={workflowState.social}>
               {!socialPosts && <button onClick={generateSocial} disabled={isLoadingSocial} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingSocial ? <Loader2 className="animate-spin" /> : <Terminal />} <span>GENERATE SOCIAL</span> </button>}
              {isLoadingSocial && <div className="text-center p-4">Broadcasting to the net...</div>}
              {socialPosts && <div className="space-y-4">
                  <div className="p-4 bg-gray-900/50 rounded-md border border-slate-700"><h4 className="font-bold text-white flex items-center space-x-2"><Linkedin size={18} className="text-[#0077b5]"/><span>LinkedIn</span></h4><p className="text-sm mt-2 whitespace-pre-wrap">{socialPosts.linkedin}</p></div>
                  <div className="p-4 bg-gray-900/50 rounded-md border border-slate-700"><h4 className="font-bold text-white flex items-center space-x-2"><Twitter size={18} className="text-[#1DA1F2]"/><span>Twitter/X</span></h4><p className="text-sm mt-2 whitespace-pre-wrap">{socialPosts.twitter}</p></div>
                  <div className="p-4 bg-gray-900/50 rounded-md border border-slate-700"><h4 className="font-bold text-white flex items-center space-x-2"><Instagram size={18} className="text-[#E1306C]"/><span>Instagram</span></h4><p className="text-sm mt-2 whitespace-pre-wrap">{socialPosts.instagram}</p></div>
              </div>}
            </StepCard>
            
            <StepCard title="Publish to CMS" icon={<UploadCloud className="text-cyan-400" />} isUnlocked={workflowState.visual} isComplete={workflowState.cms}>
              {!cmsPayload && <div className="space-y-4">
                  <div><label htmlFor="sanity-ref" className="block text-sm font-bold text-magenta-400 mb-2">Sanity Asset _ref ID</label><input type="text" id="sanity-ref" placeholder="image-a7e4b5e2f1d9c8c7b6a5...-1920x1080-jpg" value={sanityAssetRef} onChange={(e) => setSanityAssetRef(e.target.value)} className="w-full bg-gray-900 border border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-magenta-500"/></div>
                  <button onClick={publishToCms} disabled={!sanityAssetRef || isLoadingCms} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-slate-600"> {isLoadingCms ? <Loader2 className="animate-spin" /> : <Terminal />} <span>PUBLISH TO CMS</span> </button>
              </div>}
              {cmsPayload && <div>
                  <p className="text-lime-400 font-bold mb-2 flex items-center space-x-2"><CheckCircle size={20}/><span>Payload ready for Sanity CMS.</span></p>
                  <pre className="w-full h-96 overflow-y-auto bg-gray-950 p-4 rounded-md border border-slate-700 text-xs font-mono">{JSON.stringify(cmsPayload, null, 2)}</pre>
              </div>}
            </StepCard>
          </div>
        </div>
      </div>
    </div>
  );
}
