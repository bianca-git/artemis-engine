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

  const blogButton = useMemo(() => {
    if (hasContent) return null;
    
    return (
      <div className="flex flex-col gap-2">
        <button
          className="btn btn-primary btn-block"
          onClick={handleGenerateBlog}
          disabled={isLoadingBlog}
        >
          GENERATE BLOG
        </button>
        {isLoadingBlog && (
          <div className="alert alert-info">The Siren is contemplating...</div>
        )}
      </div>
    );
  }, [hasContent, handleGenerateBlog, isLoadingBlog]);

  const contentRenderer = useMemo(() => {
    if (portableTextContent?.length > 0) {
      return <PortableTextRenderer content={portableTextContent} />;
    }
    
    if (blogContent && !portableTextContent?.length) {
      return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-base-300 rounded-xl shadow-lg border border-base-300 p-8">
          <div
            dangerouslySetInnerHTML={{ __html: blogContent }}
            className="prose prose-lg prose-slate dark:prose-invert prose-h1:text-center prose-h1:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-8 prose-h3:mb-2 prose-h3:text-lg prose-code:bg-base-200 prose-code:rounded prose-code:px-2 prose-code:py-1 prose-pre:bg-base-200 prose-pre:rounded-xl prose-pre:p-4 prose-blockquote:bg-base-100 prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-base prose-table:w-full prose-table:rounded-lg prose-table:overflow-hidden prose-table:bg-base-100 prose-table:text-base prose-th:bg-base-200 prose-th:font-semibold prose-td:bg-base-100 prose-td:p-2 prose-td:border prose-td:border-base-300"
          />
        </div>
      );
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
    children: stepContent,
  }), [workflowState.topic, workflowState.blog, stepContent]);

  return (
    <section>
      <StepCard
        onReset={resetBlog}
        step={stepConfig}
      />
    </section>
  );
});

BlogStep.displayName = 'BlogStep';

export default BlogStep;