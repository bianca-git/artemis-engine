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
    const isDisabled =
      isLoadingVisual ||
  !prompt.trim() ||
      !imageScene.trim() ||
      !bodyLanguage.trim();

    return (
      <div className="flex flex-col gap-3 mb-4">
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
            placeholder="Location"
            value={location}
            onChange={handleLocationChange}
          />
          <input
            type="text"
            className="input input-bordered"
            placeholder="Pose"
            value={pose}
            onChange={handlePoseChange}
          />
        </div>
        <input
          type="text"
          className="input input-bordered"
          placeholder="Image Scene (free text)"
          value={imageScene}
          onChange={handleImageSceneChange}
        />
        <input
          type="text"
          className="input input-bordered"
          placeholder="Body Language (free text)"
          value={bodyLanguage}
          onChange={handleBodyLanguageChange}
        />
        <button
          className="btn btn-primary btn-block"
          onClick={handleGenerateVisual}
          disabled={isDisabled}
        >
          Start Visual Generation
        </button>
        {!prompt.trim() && (
          <div className="text-error text-sm mt-1">
            Please select a topic with a visual prompt before generating.
          </div>
        )}
      </div>);
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

    // Support both old and new API shapes
  const images = visualDescriptions.images || [];
  const descriptions = visualDescriptions.descriptions || visualDescriptions;
  const apiPrompt = visualDescriptions.prompt || prompt;
  const size = visualDescriptions.size || { width: 2, height: 1 };

    return (
      <>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Generated Visual ${idx + 1}`}
                className="rounded-lg border border-base-300 max-w-full h-auto shadow"
                style={{ maxHeight: 320 }}
              />
            ))}
          </div>
        )}
        <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300 mb-4">
          <pre>
{JSON.stringify(
  {
    prompt: apiPrompt,
    location,
    pose,
    scene: imageScene,
    bodyLanguage,
    descriptions,
    size,
  },
  null,
  2
)}
          </pre>
        </div>
      </>
    );
  }, [visualDescriptions, prompt, location, pose, imageScene, bodyLanguage]);

  const stepContent = useMemo(() => (
    <>
      {inputSection}
      {loadingSection}
      {resultsSection}
    </>
  ), [inputSection, loadingSection, resultsSection]);

  const stepConfig = useMemo(() => ({
    title: "Generate Visual",
    isUnlocked: workflowState.seo,
    isComplete: workflowState.visual,
    children: stepContent,
  }), [workflowState.seo, workflowState.visual, stepContent]);

  return (
  <section className="gen-surface rounded-xl">
      <StepCard
        onReset={resetVisual}
        step={stepConfig}
      />
    </section>
  );
});

VisualStep.displayName = 'VisualStep';

export default VisualStep;