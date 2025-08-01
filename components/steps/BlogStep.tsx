import React from "react";
import StepCard from "../StepCard";
import PortableTextRenderer from "../PortableTextRenderer";

const BlogSection = ({
  workflowState,
  resetBlog,
  blogContent,
  portableTextContent,
  generateBlog,
  isLoadingBlog,
  activeTopic,
}) => (
  <section>
    <StepCard
      onReset={resetBlog}
      step={{
        title: "Generate Blog Post",
        isUnlocked: workflowState.topic,
        isComplete: workflowState.blog,
        children: (
          <>
            {!portableTextContent?.length && !blogContent && (
              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => generateBlog(activeTopic)}
                  disabled={isLoadingBlog}
                >
                  GENERATE BLOG
                </button>
                {isLoadingBlog && <div className="alert alert-info">The Siren is contemplating...</div>}
              </div>
            )}
      
            {portableTextContent?.length > 0 && (
              <PortableTextRenderer content={portableTextContent} />
            )}
            
            {/* Fallback to HTML rendering if no portable text is available */}
            {!portableTextContent?.length && blogContent && (
              <div className="w-full max-w-3xl mx-auto bg-white dark:bg-base-300 rounded-xl shadow-lg border border-base-300 p-8">
                {/* Main blog content with enhanced typography and code styling */}
                <div
                  dangerouslySetInnerHTML={{ __html: blogContent }}
                  className="prose prose-lg prose-slate dark:prose-invert prose-h1:text-center prose-h1:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-8 prose-h3:mb-2 prose-h3:text-lg prose-code:bg-base-200 prose-code:rounded prose-code:px-2 prose-code:py-1 prose-pre:bg-base-200 prose-pre:rounded-xl prose-pre:p-4 prose-blockquote:bg-base-100 prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-base prose-table:w-full prose-table:rounded-lg prose-table:overflow-hidden prose-table:bg-base-100 prose-table:text-base prose-th:bg-base-200 prose-th:font-semibold prose-td:bg-base-100 prose-td:p-2 prose-td:border prose-td:border-base-300"
                />
              </div>
            )}
          </>
        ),
      }}
    />
  </section>
);

export default BlogSection;