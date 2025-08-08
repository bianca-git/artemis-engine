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
    console.log('Generating visual with:', {
      prompt: activeTopic?.VISUAL,
      scene: imageScene,
      bodyLanguage,
    });
    generateVisual(activeTopic?.VISUAL, imageScene, bodyLanguage);
  }, [generateVisual, activeTopic?.VISUAL, imageScene, bodyLanguage]);

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
    const isDisabled =
      isLoadingVisual ||
      !activeTopic?.VISUAL?.trim() ||
      !imageScene.trim() ||
      !bodyLanguage.trim();

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
          disabled={isDisabled}
        >
          Start Visual Generation
        </button>
        {!activeTopic?.VISUAL?.trim() && (
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
    activeTopic?.VISUAL,
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
    // Always show the prompt (from API or fallback to activeTopic)
    const prompt = visualDescriptions.prompt || activeTopic?.visuals || "";

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
    prompt,
    scene: imageScene,
    bodyLanguage,
    descriptions,
  },
  null,
  2
)}
          </pre>
        </div>
      </>
    );
  }, [visualDescriptions, activeTopic?.visuals, imageScene, bodyLanguage]);

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