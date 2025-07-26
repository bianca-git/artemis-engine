import React from "react";
import StepCard from "./StepCard";

const GenerationSteps = ({
  workflowState,
  resetSeo,
  seoData,
  generateSeo,
  isLoadingSeo,
  activeTopic,
  resetVisual,
  visualDescriptions,
  generateVisual,
  isLoadingVisual,
  imageScene,
  bodyLanguage,
  resetCms,
  cmsPayload,
  publishToCms,
  isLoadingCms,
  blogContent,
  sanityAssetRef,
}) => (
  <>
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
                <div className="mockup-window bg-base-200 p-4 rounded-md border border-base-300">
                  {/* SEO metaDescription as title, keywords as pills */}
                  <div className="mb-4 text-2xl font-bold text-center text-cyan-600">
                    {seoData.metaDescription || seoData.description || "SEO Meta Description"}
                  </div>
                  {seoData.keywords && Array.isArray(seoData.keywords) && seoData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-2">
                      {seoData.keywords.map((kw, idx) => (
                        <span key={idx} className="badge badge-outline badge-lg bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Fallback for keywords as string */}
                  {seoData.keywords && typeof seoData.keywords === "string" && (
                    <div className="flex flex-wrap gap-2 justify-center mb-2">
                      {seoData.keywords.split(/,|;/).map((kw, idx) => (
                        <span key={idx} className="badge badge-outline badge-lg bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ),
        }}
      />
    </section>
    {/* Generate Social Posts section removed */}
    <section>
      <StepCard
        onReset={resetVisual}
        step={{
          title: "Generate Visual",
          isUnlocked: workflowState.topic,
          isComplete: workflowState.visual,
          children: (
            <>
              {/* Add Generate Visual button if not present */}
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
                <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300 mb-4">
                  <pre>{JSON.stringify(visualDescriptions, null, 2)}</pre>
                </div>
              )}
              {/* Add button to send visualDescriptions to Google Sheets */}
              {visualDescriptions && (
                <button
                  className="btn btn-accent btn-block mt-2"
                  onClick={() => publishVisualToSheets(visualDescriptions)}
                >
                  SEND TO GOOGLE SHEETS
                </button>
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
          isUnlocked: workflowState.blog || workflowState.visual || workflowState.seo,
          isComplete: workflowState.cms,
          children: (
            <>
              {!cmsPayload && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => publishToCms(activeTopic, blogContent, seoData, visualDescriptions, sanityAssetRef)}
                  disabled={isLoadingCms}
                >
                  PUBLISH TO CMS
                </button>
              )}
              {isLoadingCms && <div className="alert alert-info">Publishing to CMS...</div>}
              {cmsPayload && (
                <div className="alert alert-success">
                  <h1>Success!</h1>
                </div>
              )}
            </>
          ),
        }}
      />
    </section>
  </>
);

function publishVisualToSheets(visualDescriptions: any): void {
  // Example: POST visualDescriptions to an API endpoint for Google Sheets integration
  fetch("/api/publish-visual-sheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visualDescriptions }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to publish visuals to Google Sheets");
      return res.json();
    })
    .then(() => {
      alert("Visual descriptions sent to Google Sheets!");
    })
    .catch((err) => {
      alert("Error sending to Google Sheets: " + err.message);
    });
}

export default GenerationSteps;

