import React from "react";

const SelectTopicSection = ({
  csvData,
  activeTopic,
  selectTopic,
  workflowState,
  setWorkflowState,
}) => (
  <section>
    <div className="card w-full bg-base-100 shadow-xl mb-4">
      <div className="card-body">
        <h2 className="card-title">2. Select Active Topic</h2>
        <ul className="menu bg-base-200 rounded-box">
          {csvData.map(topic => (
            <li key={topic.ID}>
              <button
                className={`btn btn-outline w-full text-left ${activeTopic?.ID === topic.ID ? "btn-primary" : ""}`}
                onClick={() => {
                  selectTopic(topic);
                  if (!workflowState.topic) setWorkflowState(prev => ({ ...prev, topic: true }));
                }}
              >
                <span className="font-bold">{topic.TITLE}</span>
                <span className="ml-2">{topic.CONTENT}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default SelectTopicSection;