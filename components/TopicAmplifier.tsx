import React from "react";

const TopicAmplifier = ({
  topicKeyword,
  setTopicKeyword,
  topicIdeas,
  amplifyTopic,
  isLoadingTopicIdeas,
  addIdeaToCsv,
}) => (
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
                amplifyTopic(topicKeyword);
              }
            }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => amplifyTopic(topicKeyword)}
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

export default TopicAmplifier;