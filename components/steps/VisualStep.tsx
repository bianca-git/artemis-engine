import React, { useCallback, useMemo } from "react";
import StepCard from "../StepCard";
import { apiClient } from "../../utils/apiClient";

/**
 * Optimized Visual generation component using centralized API client
 */
const VisualStep = React.memo(({
  workflowState,
  visualDescriptions,
  generateVisual,
  isLoadingVisual,
  activeTopic,
  resetVisual,
}: any) => {
  // Free text fields for additional prompt context - moved to local state for better performance
  const [imageScene, setImageScene] = React.useState("");
  const [bodyLanguage, setBodyLanguage] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [pose, setPose] = React.useState("");

  // Parse VISUAL JSON whenever activeTopic changes
  React.useEffect(() => {
    if (activeTopic?.VISUAL) {
      try {
        const v = JSON.parse(activeTopic.VISUAL);
        setPrompt(v.prompt || "");
        setLocation(v.location || "");
        setPose(v.pose || "");
      } catch {
        setPrompt(activeTopic.VISUAL);
        setLocation("");
        setPose("");
      }
    } else {
      setPrompt("");
      setLocation("");
      setPose("");
    }
  }, [activeTopic?.VISUAL]);

  const publishVisualToSheets = useCallback(async (visualDescriptions: any[]) => {
    try {
      // Server route expects { descriptions }
      const response = await apiClient.post("/publish-visuals", { descriptions: visualDescriptions });
      if (response.success) {
        alert("Visual descriptions sent to Google Sheets!");
      } else {
        throw new Error(response.error || "Failed to publish visuals to Google Sheets");
      }
    } catch (err: any) {
      alert("Error sending to Google Sheets: " + err.message);
    }
  }, []);

  const handleGenerateVisual = useCallback(() => {
    const visualObj = { prompt, location, pose };
    console.log('Generating visual with:', { visualObj, scene: imageScene, bodyLanguage });
    generateVisual(visualObj, imageScene, bodyLanguage);
  }, [generateVisual, prompt, location, pose, imageScene, bodyLanguage]);

  const handleImageSceneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageScene(e.target.value);
  }, []);

  const handleBodyLanguageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyLanguage(e.target.value);
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value), []);
  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value), []);
  const handlePoseChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPose(e.target.value), []);

  const handlePublishToSheets = useCallback(() => {
    publishVisualToSheets(visualDescriptions);
  }, [publishVisualToSheets, visualDescriptions]);

  const inputSection = useMemo(() => {
    // Determine if we have existing results to toggle button label
    const hasVisuals = !!(visualDescriptions && ((visualDescriptions.images && visualDescriptions.images.length) || (Array.isArray(visualDescriptions.descriptions) && visualDescriptions.descriptions.length)));
    const isDisabled = isLoadingVisual || !prompt.trim();

    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            className="input input-bordered"
            placeholder="Prompt"
            value={prompt}
            onChange={handlePromptChange}
          />
          <input
            type="text"
            className="input input-bordered"
            placeholder="Location (optional)"
            value={location}
            onChange={handleLocationChange}
          />
          <input
            type="text"
            className="input input-bordered"
            placeholder="Pose (optional)"
            value={pose}
            onChange={handlePoseChange}
          />
        </div>
        <details className="bg-base-200 rounded-md border border-base-300 p-3">
          <summary className="cursor-pointer text-sm font-semibold">Advanced Context</summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              className="input input-bordered"
              placeholder="Scene"
              value={imageScene}
              onChange={handleImageSceneChange}
            />
            <input
              type="text"
              className="input input-bordered"
              placeholder="Body Language"
              value={bodyLanguage}
              onChange={handleBodyLanguageChange}
            />
          </div>
        </details>
        <button
          className="btn btn-primary btn-block"
          onClick={handleGenerateVisual}
          disabled={isDisabled}
        >
          {hasVisuals ? 'REGENERATE VISUALS' : 'GENERATE VISUALS'}
        </button>
        {!prompt.trim() && (
          <div className="text-error text-sm mt-1">
            Please select a topic with a visual prompt before generating.
          </div>
        )}
      </div>
    );
  }, [
    visualDescriptions,
    imageScene,
    bodyLanguage,
    handleImageSceneChange,
    handleBodyLanguageChange,
    handleGenerateVisual,
    isLoadingVisual,
    prompt,
    location,
    pose,
    handlePromptChange,
    handleLocationChange,
    handlePoseChange,
  ]);

  const loadingSection = useMemo(() => {
    if (!isLoadingVisual) return null;
    return <div className="alert alert-info">Generating Visual...</div>;
  }, [isLoadingVisual]);

  const resultsSection = useMemo(() => {
    if (!visualDescriptions) return null;
    const images = visualDescriptions.images || [];
    const descriptions = visualDescriptions.descriptions || visualDescriptions;
    const apiPrompt = visualDescriptions.prompt || prompt;
    const size = visualDescriptions.size || { width: 2, height: 1 };
    const summary = `${Array.isArray(descriptions) ? descriptions.length : 0} desc • ${apiPrompt?.length || 0} chars prompt`;
    return { images, descriptions, apiPrompt, size, summary };
  }, [visualDescriptions, prompt, location, pose, imageScene, bodyLanguage]);

  const [showRaw, setShowRaw] = React.useState(false);

  const resultsRender = useMemo(() => {
    if (!resultsSection) return null;
    const { images, descriptions, apiPrompt, size, summary } = resultsSection as any;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm opacity-80">
          <span className="font-mono">{summary}</span>
          <button type="button" className="btn btn-xs" onClick={() => setShowRaw(r => !r)}>
            {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
          </button>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {images.map((img: string, idx: number) => (
              <figure key={idx} className="flex flex-col gap-1">
                <img
                  src={img}
                  alt={`Generated Visual ${idx + 1}`}
                  className="rounded-lg border border-base-300 max-w-full h-auto shadow"
                  style={{ maxHeight: 320 }}
                />
                <figcaption className="text-[10px] uppercase tracking-wide opacity-60 text-center">#{idx + 1}</figcaption>
              </figure>
            ))}
          </div>
        )}
        {showRaw && (
          <details open className="bg-base-200 rounded-md border border-base-300">
            <summary className="cursor-pointer px-4 py-2 text-sm font-semibold">Raw Visual Prompt</summary>
            <div className="mockup-code bg-base-200 p-4 rounded-b-md border-t border-base-300 overflow-x-auto">
              <pre className="text-xs">{JSON.stringify({ prompt: apiPrompt, location, pose }, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    );
  }, [resultsSection, showRaw, location, pose, imageScene, bodyLanguage]);

  const stepContent = useMemo(() => (
    <>
      {inputSection}
      {loadingSection}
    {resultsRender}
    </>
  ), [inputSection, loadingSection, resultsRender]);

  const stepConfig = useMemo(() => ({
    title: "Generate Visual",
    isUnlocked: workflowState.seo,
    isComplete: workflowState.visual,
    hintLocked: 'Generate SEO first to refine visual context.',
    children: stepContent,
  }), [workflowState.seo, workflowState.visual, stepContent]);

  return <StepCard onReset={resetVisual} step={stepConfig} />;
});

VisualStep.displayName = 'VisualStep';

export default VisualStep;