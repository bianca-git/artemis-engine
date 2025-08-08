import React from "react";

const SelectTopicSection = ({
  csvData,
  activeTopic,
  selectTopic,
  workflowState,
  setWorkflowState,
  resetBlog,
  resetSeo,
  resetVisual,
  resetSocial,
  resetCms,
}) => (
  <section>
    <div className="w-full mb-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Select Active Topic</h2>
        <div className="w-full">
          {csvData.map((topic, index) => {
            const isActive = activeTopic?.ID === topic.ID;
            // Ensure unique key by combining ID with index as fallback
            const uniqueKey = topic.ID && topic.ID.trim() ? topic.ID : `topic-${index}`;
            
            return (
              <div
                key={uniqueKey}
                className={`transition-all border rounded-lg mb-2 shadow-sm ${isActive ? "border-primary bg-primary/10" : "border-neutral-200 bg-base-100"}`}
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                  aria-expanded={isActive}
                  onClick={() => {
                    const proceed = window.confirm('Selecting a new topic will clear generated Blog, SEO, Visuals, Social, and CMS progress. Continue?');
                    if (!proceed) return;
                    // Reset all steps
                    resetCms?.();
                    resetSocial?.();
                    resetVisual?.();
                    resetSeo?.();
                    resetBlog?.();
                    // Update topic selection and workflow state
                    selectTopic(topic);
                    if (!workflowState.topic) setWorkflowState((prev: any) => ({ ...prev, topic: true }));
                  }}
                >
                  <span className="font-bold text-lg text-neutral-400 flex items-center gap-2">
                    {topic.TITLE}
                    {isActive && <span className="ml-2 text-primary text-xl" title="Active">👩🏻‍💻</span>}
                  </span>

                  <span className="ml-2 text-neutral-400 font-bold">{isActive ? "👈🏻" : "✒️"}</span>
                </button>
                {isActive && (
                  <div className="px-4 pb-4 text-xs text-neutral-500 font-semibold font-mono space-y-1">
                    <div>📖 {topic.CONTENT}</div>
                    <div>🖼️ {topic.VISUAL}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default SelectTopicSection;