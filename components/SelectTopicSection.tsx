import React, { useState, useMemo } from "react";

interface SelectTopicSectionProps {
  csvData: any[];
  activeTopic: any | null;
  selectTopic: (t: any) => void;
  workflowState: any;
  setWorkflowState: (fn: (prev: any) => any) => void;
  resetBlog?: () => void;
  resetSeo?: () => void;
  resetVisual?: () => void;
  resetSocial?: () => void;
  resetCms?: () => void;
  hasGeneratedBlog?: boolean;
  hasGeneratedSeo?: boolean;
  hasGeneratedVisuals?: boolean;
  hasGeneratedSocial?: boolean;
  hasGeneratedCms?: boolean;
}

const SelectTopicSection: React.FC<SelectTopicSectionProps> = ({
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
  hasGeneratedBlog,
  hasGeneratedSeo,
  hasGeneratedVisuals,
  hasGeneratedSocial,
  hasGeneratedCms,
}) => {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    if (!filter.trim()) return csvData;
    const f = filter.toLowerCase();
    return csvData.filter(t =>
      (t.TITLE || "").toLowerCase().includes(f) ||
      (t.CONTENT || "").toLowerCase().includes(f)
    );
  }, [csvData, filter]);

  return (
  <section>
    <div className="w-full mb-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Select Active Topic</h2>
        <div className="mb-3 flex items-center gap-2">
          <label htmlFor="topic-filter" className="text-xs font-semibold uppercase tracking-wide opacity-70">Filter</label>
          <input
            id="topic-filter"
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="Search by title or content"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {filter && (
            <button type="button" className="btn btn-xs" onClick={() => setFilter("")}>Clear</button>
          )}
        </div>
        <div className="w-full" role="listbox" aria-label="Topics list">
          {filtered.map((topic, index) => {
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
                    const switching = activeTopic && activeTopic.ID !== topic.ID;
                    const generated = !!(hasGeneratedBlog || hasGeneratedSeo || hasGeneratedVisuals || hasGeneratedSocial || hasGeneratedCms);
                    if (switching && generated) {
                      const proceed = window.confirm('Switching topics will clear existing generated content. Continue?');
                      if (!proceed) return;
                    }
                    if (switching) {
                      // Reset only when switching
                      resetCms?.();
                      resetSocial?.();
                      resetVisual?.();
                      resetSeo?.();
                      resetBlog?.();
                    }
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
          {filtered.length === 0 && (
            <div className="text-sm opacity-60 italic">No topics match your filter.</div>
          )}
        </div>
      </div>
    </div>
  </section>
  );
};

export default SelectTopicSection;