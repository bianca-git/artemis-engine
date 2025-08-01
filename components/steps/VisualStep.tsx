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

  const publishVisualToSheets = useCallback(async (visualDescriptions: any[]) => {
    try {
      const response = await apiClient.post("/publish-visual-sheets", { visualDescriptions });
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
    generateVisual(activeTopic?.visuals, imageScene, bodyLanguage);
  }, [generateVisual, activeTopic?.visuals, imageScene, bodyLanguage]);

  const handleImageSceneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageScene(e.target.value);
  }, []);

  const handleBodyLanguageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyLanguage(e.target.value);
  }, []);

  const handlePublishToSheets = useCallback(() => {
    publishVisualToSheets(visualDescriptions);
  }, [publishVisualToSheets, visualDescriptions]);

  const inputSection = useMemo(() => {
    if (visualDescriptions) return null;
    
    return (
      <div className="flex flex-col gap-3 mb-4">
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
          disabled={isLoadingVisual}
        >
          GENERATE VISUAL
        </button>
      </div>
    );
  }, [visualDescriptions, imageScene, bodyLanguage, handleImageSceneChange, handleBodyLanguageChange, handleGenerateVisual, isLoadingVisual]);

  const loadingSection = useMemo(() => {
    if (!isLoadingVisual) return null;
    return <div className="alert alert-info">Generating Visual...</div>;
  }, [isLoadingVisual]);

  const resultsSection = useMemo(() => {
    if (!visualDescriptions) return null;
    
    return (
      <>
        <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300 mb-4">
          <pre>{JSON.stringify(visualDescriptions, null, 2)}</pre>
        </div>
        <button
          className="btn btn-accent btn-block mt-2"
          onClick={handlePublishToSheets}
        >
          SEND TO GOOGLE SHEETS
        </button>
      </>
    );
  }, [visualDescriptions, handlePublishToSheets]);

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
    <section>
      <StepCard
        onReset={resetVisual}
        step={stepConfig}
      />
    </section>
  );
});

VisualStep.displayName = 'VisualStep';

export default VisualStep;