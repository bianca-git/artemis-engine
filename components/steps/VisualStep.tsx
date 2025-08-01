import React, { useState } from "react";
import StepCard from "../StepCard";
import { apiClient } from "../../utils/apiClient";

/**
 * Optimized Visual generation component using centralized API client
 */
const VisualStep = ({
  workflowState,
  visualDescriptions,
  generateVisual,
  isLoadingVisual,
  activeTopic,
  resetVisual,
}) => {
  // Free text fields for additional prompt context
  const [imageScene, setImageScene] = useState("");
  const [bodyLanguage, setBodyLanguage] = useState("");

  const publishVisualToSheets = async (visualDescriptions: any[]) => {
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
  };

  return (
    <section>
      <StepCard
        onReset={resetVisual}
        step={{
          title: "Generate Visual",
          isUnlocked: workflowState.seo,
          isComplete: workflowState.visual,
          children: (
            <>
              {/* Show input fields and button if visuals not yet generated */}
              {!visualDescriptions && (
                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Image Scene (free text)"
                    value={imageScene}
                    onChange={(e) => setImageScene(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Body Language (free text)"
                    value={bodyLanguage}
                    onChange={(e) => setBodyLanguage(e.target.value)}
                  />
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => generateVisual(activeTopic?.visuals, imageScene, bodyLanguage)}
                    disabled={isLoadingVisual}
                  >
                    GENERATE VISUAL
                  </button>
                </div>
              )}
              {isLoadingVisual && <div className="alert alert-info">Generating Visual...</div>}
              {/* Show results and Google Sheets button after generation */}
              {visualDescriptions && (
                <>
                  <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300 mb-4">
                    <pre>{JSON.stringify(visualDescriptions, null, 2)}</pre>
                  </div>
                  <button
                    className="btn btn-accent btn-block mt-2"
                    onClick={() => publishVisualToSheets(visualDescriptions)}
                  >
                    SEND TO GOOGLE SHEETS
                  </button>
                </>
              )}
            </>
          ),
        }}
      />
    </section>
  );
};

export default VisualStep;