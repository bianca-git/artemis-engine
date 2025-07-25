import React from "react";
import StepCard from "./StepCard";

const BlogSection = ({
  workflowState,
  resetBlog,
  blogContent,
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
            {!blogContent && (
              <button
                className="btn btn-primary btn-block"
                onClick={() => generateBlog(activeTopic)}
                disabled={isLoadingBlog}
              >
                GENERATE BLOG
              </button>
            )}
            {isLoadingBlog && <div className="alert alert-info">The Siren is contemplating...</div>}
            {blogContent && (
              <div className="mockup-code bg-base-200 p-4 rounded-md border border-base-300 whitespace-pre-wrap">
                <pre>{blogContent}</pre>
              </div>
            )}
          </>
        ),
      }}
    />
  </section>
);

export default BlogSection;