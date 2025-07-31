import React, { useRef } from "react";
import TopicAmplifier from "./TopicAmplifier";
import LoadDataSection from "./LoadDataSection";
import SelectTopicSection from "./SelectTopicSection";

const TopicWorkflowSection = ({
  topicKeyword,
  setTopicKeyword,
  topicIdeas,
  setTopicIdeas,
  amplifyTopic,
  isLoadingTopicIdeas,
  addIdeaToCsv,
  csvText,
  setCsvText,
  csvData,
  setCsvData,
  selectTopic,
  activeTopic,
  workflowState,
  setWorkflowState,
  handleLoadData,
  csvRefreshTimeout,
}) => {
  // Example: you can add any cross-section logic here if needed
  return (
    <div className="space-y-8">
      <TopicAmplifier
        topicKeyword={topicKeyword}
        setTopicKeyword={setTopicKeyword}
        topicIdeas={topicIdeas}
        amplifyTopic={amplifyTopic}
        isLoadingTopicIdeas={isLoadingTopicIdeas}
        addIdeaToCsv={addIdeaToCsv}
      />
      <LoadDataSection
        csvText={csvText}
        setCsvText={setCsvText}
        csvData={csvData}
        setCsvData={setCsvData}
        selectTopic={selectTopic}
        setWorkflowState={setWorkflowState}
        handleLoadData={handleLoadData}
        csvRefreshTimeout={csvRefreshTimeout}
      />
      <SelectTopicSection
        csvData={csvData}
        activeTopic={activeTopic}
        selectTopic={selectTopic}
        workflowState={workflowState}
        setWorkflowState={setWorkflowState}
      />
    </div>
  );
};

export default TopicWorkflowSection;
