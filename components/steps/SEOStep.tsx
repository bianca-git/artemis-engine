import StepCard from "../StepCard";

const SEOStep = ({
  workflowState,
  seoData,
  generateSeo,
  isLoadingSeo,
  activeTopic,
  resetSeo,
}) => (
  <section>
    <StepCard
      onReset={resetSeo}
      step={{
        title: "Generate SEO",
        isUnlocked: workflowState.blog,
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
);

export default SEOStep;