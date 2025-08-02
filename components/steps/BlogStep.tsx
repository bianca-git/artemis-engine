import React, { useCallback, useMemo } from "react";
import StepCard from "../StepCard";
import BlogSection from "../BlogSection";
import { portableTextToPlainText } from "../../utils/helpers";

/**
 * Optimized BlogStep component with React performance optimizations
 */
const BlogStep = React.memo(({
  workflowState,
  resetBlog,
  blogContent,
  portableTextContent,
  isStreamingBlog,
  streamingBlogContent,
  generateBlog,
  generateBlogStreaming,
  setBlogContent,
  setPortableTextContent,
  isLoadingBlog,
  activeTopic,
}: any) => {
  const handleGenerateBlog = useCallback(() => {
    generateBlog(activeTopic);
  }, [generateBlog, activeTopic]);

  const handleGenerateBlogStreaming = useCallback(() => {
    generateBlogStreaming(activeTopic);
  }, [generateBlogStreaming, activeTopic]);

  const handleBlogChange = useCallback((newContent: any[]) => {
    setPortableTextContent(newContent);
    // Also update the plain text version
    const plainText = portableTextToPlainText(newContent);
    setBlogContent(plainText);
  }, [setPortableTextContent, setBlogContent]);

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
      isStreamingBlog={isStreamingBlog}
      streamingBlogContent={streamingBlogContent}
      onGenerate={handleGenerateBlog}
      onGenerateStreaming={handleGenerateBlogStreaming}
      onBlogChange={handleBlogChange}
      onDownload={handleDownload}
    />
  ), [
    blogContent, 
    portableTextContent, 
    isLoadingBlog, 
    isStreamingBlog,
    streamingBlogContent,
    handleGenerateBlog, 
    handleGenerateBlogStreaming,
    handleBlogChange,
    handleDownload
  ]);

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