import React, { useCallback, useMemo } from "react";

/**
 * Optimized TopicAmplifier component with React performance optimizations
 */
const TopicAmplifier = React.memo(({
  topicKeyword,
  setTopicKeyword,
  topicIdeas,
  amplifyTopic,
  isLoadingTopicIdeas,
  addIdeaToCsv,
  setCsvText,
}: any) => {
  // Memoized helper to convert ideas to CSV string
  const ideasToCsv = useCallback((ideas: any[] | string): string => {
    if (!ideas) return '';
    if (typeof ideas === 'string') {
      // Already a CSV string, just return it
      return ideas;
    }
    if (!Array.isArray(ideas) || ideas.length === 0) return '';
    const headers = Object.keys(ideas[0]);
    const rows = ideas.map((idea: Record<string, any>) =>
      headers.map(h => JSON.stringify(idea[h] ?? "")).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }, []);

  const handleAmplify = useCallback(async (keyword: string) => {
    const ideas = await amplifyTopic(keyword);
    if (setTopicKeyword) setTopicKeyword("");
    if (setCsvText) {
      setCsvText(ideasToCsv(ideas));
    }
  }, [amplifyTopic, setTopicKeyword, setCsvText, ideasToCsv]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      !isLoadingTopicIdeas &&
      topicKeyword.trim().length > 0
    ) {
      handleAmplify(topicKeyword);
    }
  }, [handleAmplify, isLoadingTopicIdeas, topicKeyword]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicKeyword(e.target.value);
  }, [setTopicKeyword]);

  const handleAmplifyClick = useCallback(() => {
    handleAmplify(topicKeyword);
  }, [handleAmplify, topicKeyword]);

  // Memoize the topic ideas list to prevent unnecessary re-renders
  const topicIdeasList = useMemo(() => {
    if (!Array.isArray(topicIdeas) || topicIdeas.length === 0) return null;
    
    return (
      <ul className="menu bg-base-200 rounded-box">
        {topicIdeas.map((idea, i) => (
          <li key={i}>
            <span className="font-bold">{idea.TITLE}</span>
            <button 
              className="btn btn-accent btn-xs ml-2" 
              onClick={() => addIdeaToCsv(idea)}
            >
              Add to Data List
            </button>
          </li>
        ))}
      </ul>
    );
  }, [topicIdeas, addIdeaToCsv]);

  const isDisabled = useMemo(() => 
    isLoadingTopicIdeas || topicKeyword.trim().length === 0,
    [isLoadingTopicIdeas, topicKeyword]
  );

  return (
    <section>
      <div className="card w-full bg-base-100 shadow-xl mb-4">
        <div className="card-body">
          <h2 className="card-title">Topic Amplifier</h2>
          <p>Enter a keyword to brainstorm new topics.</p>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g., 'Excel automation'"
              value={topicKeyword}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              onKeyDown={handleKeyDown}
            />
            <button
        className="btn btn-primary btn-sm w-full sm:w-auto"
              onClick={handleAmplifyClick}
              disabled={isDisabled}
            >
              Amplify
            </button>
          </div>
          {/* Show loading alert only if a non-empty keyword was provided */}
          {isLoadingTopicIdeas && topicKeyword.trim().length > 0 && (
            <div className="alert alert-info">Amplifying {topicKeyword}...</div>
          )}
          {topicIdeasList}
        </div>
      </div>
    </section>
  );
});

TopicAmplifier.displayName = 'TopicAmplifier';

export default TopicAmplifier;