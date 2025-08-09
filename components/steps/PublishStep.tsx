import StepCard from "../StepCard";

const PublishStep = ({
  workflowState,
  cmsPayload,
  publishToCms,
  isLoadingCms,
  activeTopic,
  blogContent,
  seoData,
  visualDescriptions,
  sanityAssetRef,
  resetCms,
}) => (
  <section className="publish-surface rounded-xl">
    <StepCard
      onReset={resetCms}
      step={{
        title: "Publish to CMS",
        isUnlocked: workflowState.visual,
        isComplete: workflowState.cms,
        children: (
          <>
            {!cmsPayload && (
              <button
                className="btn btn-primary btn-block"
                onClick={() =>
                  publishToCms(
                    activeTopic,
                    blogContent,
                    seoData,
                    visualDescriptions,
                    sanityAssetRef
                  )
                }
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
);

export default PublishStep;