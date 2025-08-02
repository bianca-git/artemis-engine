import React, { useCallback, useMemo } from "react";
import StepCard from "../StepCard";
import BlogSection from "../BlogSection";

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

  const handleCopy = useCallback(() => {
    if (blogContent) {
      navigator.clipboard.writeText(blogContent);
    }
  }, [blogContent]);

  const handleDownload = useCallback(() => {
    if (blogContent) {
      const element = document.createElement('a');
      const file = new Blob([blogContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `blog-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }, [blogContent]);

  const stepContent = useMemo(() => (
    <BlogSection
      blog={blogContent}
      blogPortableText={portableTextContent}
      isGenerating={isLoadingBlog}
      onGenerate={handleGenerateBlog}
      onCopy={handleCopy}
      onDownload={handleDownload}
    />
  ), [blogContent, portableTextContent, isLoadingBlog, handleGenerateBlog, handleCopy, handleDownload]);

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