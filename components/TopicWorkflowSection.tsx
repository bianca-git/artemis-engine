import React, { useMemo } from "react";
import TopicAmplifier from "./TopicAmplifier";
import LoadDataSection from "./LoadDataSection";
import SelectTopicSection from "./SelectTopicSection";

/**
 * Optimized TopicWorkflowSection with React performance optimizations
 * Memoizes component sections to prevent unnecessary re-renders
 */
const TopicWorkflowSection = React.memo(({
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
  resetBlog,
  resetSeo,
  resetVisual,
  resetSocial,
  resetCms,
}: any) => {
  // Memoize TopicAmplifier props to prevent unnecessary re-renders
  const topicAmplifierProps = useMemo(() => ({
    topicKeyword,
    setTopicKeyword,
    topicIdeas,
    amplifyTopic,
    isLoadingTopicIdeas,
    addIdeaToCsv,
    setCsvText,
  }), [topicKeyword, setTopicKeyword, topicIdeas, amplifyTopic, isLoadingTopicIdeas, addIdeaToCsv, setCsvText]);

  // Memoize LoadDataSection props
  const loadDataSectionProps = useMemo(() => ({
    csvText,
    setCsvText,
    csvData,
    setCsvData,
    selectTopic,
    setWorkflowState,
    handleLoadData,
    csvRefreshTimeout,
  }), [csvText, setCsvText, csvData, setCsvData, selectTopic, setWorkflowState, handleLoadData, csvRefreshTimeout]);

  // Memoize SelectTopicSection props
  const selectTopicSectionProps = useMemo(() => ({
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
  }), [csvData, activeTopic, selectTopic, workflowState, setWorkflowState, resetBlog, resetSeo, resetVisual, resetSocial, resetCms]);

  return (
    <div className="space-y-8">
      <TopicAmplifier {...topicAmplifierProps} />
      <LoadDataSection {...loadDataSectionProps} />
      <SelectTopicSection {...selectTopicSectionProps} />
    </div>
  );
});

TopicWorkflowSection.displayName = 'TopicWorkflowSection';

export default TopicWorkflowSection;
