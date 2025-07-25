import React from "react";

const SelectTopicSection = ({
  csvData,
  activeTopic,
  selectTopic,
  workflowState,
  setWorkflowState,
}) => (
  <section>
    <div className="w-full mb-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">2. Select Active Topic</h2>
        <div className="w-full">
          {csvData.map(topic => {
            const isActive = activeTopic?.ID === topic.ID;
            return (
              <div
                key={topic.ID}
                className={`transition-all border rounded-lg mb-2 shadow-sm ${isActive ? "border-primary bg-primary/10" : "border-neutral-200 bg-base-100"}`}
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                  aria-expanded={isActive}
                  onClick={() => {
                    selectTopic(topic);
                    if (!workflowState.topic) setWorkflowState(prev => ({ ...prev, topic: true }));
                  }}
                >
                  <span className="font-bold text-lg text-primary flex items-center gap-2">
                    {topic.TITLE}
                    {isActive && <span className="ml-2 text-primary text-xl" title="Active">★</span>}
                  </span>
                  <span className="ml-2 text-neutral-400">{isActive ? "▼" : "✒️"}</span>
                </button>
                {isActive && (
                  <div className="px-4 pb-4 text-sm animate-fade-in">
                    {topic.CONTENT}
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