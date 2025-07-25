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
                <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                  <pre>{JSON.stringify(seoData, null, 2)}</pre>
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
                <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                  <pre>{JSON.stringify(visualDescriptions, null, 2)}</pre>
                </div>
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
                <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300">
                  <pre>{JSON.stringify(cmsPayload, null, 2)}</pre>
                </div>
              )}
            </>
          ),
        }}
      />
    </section>
  </>
);

export default GenerationSteps;