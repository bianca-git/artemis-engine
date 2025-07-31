import React from "react";


const TopicAmplifier = ({
  topicKeyword,
  setTopicKeyword,
  topicIdeas,
  amplifyTopic,
  isLoadingTopicIdeas,
  addIdeaToCsv,
  setCsvText,
}) => {
  // Helper to convert ideas to CSV string
  const ideasToCsv = (ideas) => {
    if (!ideas || ideas.length === 0) return '';
    const headers = Object.keys(ideas[0]);
    const rows = ideas.map(idea => headers.map(h => JSON.stringify(idea[h] ?? "")).join(","));
    return [headers.join(","), ...rows].join("\n");
  };

  const handleAmplify = async (keyword) => {
    // Run amplifyTopic and wait for it to finish
    const result = await amplifyTopic(keyword);
    // After amplification, clear and populate csvText
    if (setCsvText) {
      setCsvText("");
      // Use topicIdeas if amplifyTopic doesn't return ideas directly
      setTimeout(() => {
        setCsvText(ideasToCsv(result?.ideas || topicIdeas));
      }, 0);
    }
  };

  return (
    <section>
      <div className="card w-full bg-base-100 shadow-xl mb-4">
        <div className="card-body">
          <h2 className="card-title">Topic Amplifier</h2>
          <p>Enter a keyword to brainstorm new topics.</p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g., 'Excel automation'"
              value={topicKeyword}
              onChange={e => setTopicKeyword(e.target.value)}
              className="input input-bordered w-full"
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !isLoadingTopicIdeas &&
                  topicKeyword.trim().length > 0
                ) {
                  handleAmplify(topicKeyword);
                }
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAmplify(topicKeyword)}
              disabled={isLoadingTopicIdeas || topicKeyword.trim().length === 0}
            >
              Amplify
            </button>
          </div>
          {isLoadingTopicIdeas && <div className="alert alert-info">Amplifying ideas...</div>}
          {topicIdeas.length > 0 && (
            <ul className="menu bg-base-200 rounded-box">
              {topicIdeas.map((idea, i) => (
                <li key={i}>
                  <span className="font-bold">{idea.TITLE}</span>
                  <button className="btn btn-accent btn-xs ml-2" onClick={() => addIdeaToCsv(idea)}>Add to Data List</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopicAmplifier;