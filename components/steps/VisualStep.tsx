import React, { useState } from "react";
import StepCard from "../StepCard";
import { publishVisualToSheets } from "../../utils/api";

const VisualStep = ({
  workflowState,
  visualDescriptions,
  generateVisual,
  isLoadingVisual,
  activeTopic,
  resetVisual,
}) => {
  // Local state for free text fields
  const [imageScene, setImageScene] = useState("");
  const [bodyLanguage, setBodyLanguage] = useState("");

  return (
    <section>
      <StepCard
        onReset={resetVisual}
        step={{
          title: "Generate Visual",
          isComplete: workflowState.seo,
          isUnlocked: workflowState.visual,
          children: (
            <>
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