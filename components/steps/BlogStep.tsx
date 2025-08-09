import React, { useCallback, useMemo } from "react";
import StepCard from "../StepCard";
import PortableTextRenderer from "../PortableTextRenderer";

/**
 * Optimized BlogStep component with React performance optimizations
 */
const BlogStep = React.memo(({
  workflowState,
  resetBlog,
  blogContent,
  portableTextContent,
  generateBlog,
  isLoadingBlog,
  activeTopic,
}: any) => {
  const handleGenerateBlog = useCallback(() => {
    generateBlog(activeTopic);
  }, [generateBlog, activeTopic]);

  const hasContent = useMemo(() => 
    portableTextContent?.length > 0 || blogContent,
    [portableTextContent, blogContent]
  );

  const blogButton = useMemo(() => (
    <div className="flex flex-col gap-2">
      <button
        className="btn btn-primary btn-block"
        onClick={handleGenerateBlog}
        disabled={isLoadingBlog}
      >
        {hasContent ? 'REGENERATE BLOG' : 'GENERATE BLOG'}
      </button>
      {isLoadingBlog && (
        <div className="alert alert-info">The Siren is contemplating...</div>
      )}
    </div>
  ), [hasContent, handleGenerateBlog, isLoadingBlog]);

  const contentRenderer = useMemo(() => {
    if (portableTextContent?.length > 0) {
      return <PortableTextRenderer content={portableTextContent} />;
    }

    // Optionally, render blogContent as plain text or HTML if it's a string
    if (blogContent && !portableTextContent?.length) {
      return <div>{blogContent}</div>;
    }

    return null;
  }, [portableTextContent, blogContent]);

  const stepContent = useMemo(() => (
    <>
      {blogButton}
      {contentRenderer}
    </>
  ), [blogButton, contentRenderer]);

  const stepConfig = useMemo(() => ({
    title: "Generate Blog Post",
    isUnlocked: workflowState.topic,
    isComplete: workflowState.blog,
    hintLocked: 'Select a topic first to unlock blog generation.',
    children: stepContent,
  }), [workflowState.topic, workflowState.blog, stepContent]);

  return <StepCard onReset={resetBlog} step={stepConfig} />;
});

BlogStep.displayName = 'BlogStep';

export default BlogStep;