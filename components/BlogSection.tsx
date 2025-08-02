import React from 'react';
import { Download } from 'lucide-react';
import PortableTextEditor from './PortableTextEditor';
import type { PortableTextBlock } from '@portabletext/types';

interface BlogSectionProps {
  blog: string;
  blogPortableText: PortableTextBlock[] | null;
  isGenerating: boolean;
  isStreamingBlog?: boolean;
  streamingBlogContent?: string;
  onGenerate: () => void;
  onGenerateStreaming?: () => void;
  onBlogChange?: (content: PortableTextBlock[]) => void;
  onDownload: () => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  blog,
  blogPortableText,
  isGenerating,
  isStreamingBlog = false,
  streamingBlogContent = '',
  onGenerate,
  onGenerateStreaming,
  onBlogChange,
  onDownload,
}) => {
  const hasContent = blog || (blogPortableText && blogPortableText.length > 0);
  const displayContent = blogPortableText || [];

  const handleContentChange = (newContent: PortableTextBlock[]) => {
    if (onBlogChange) {
      onBlogChange(newContent);
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-primary">Generated Blog Content</h3>
          <div className="flex gap-2">
            {onGenerateStreaming && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onGenerateStreaming}
                disabled={isGenerating || isStreamingBlog}
              >
                {isStreamingBlog ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Streaming...
                  </>
                ) : (
                  'Generate (Streaming)'
                )}
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={onGenerate}
              disabled={isGenerating || isStreamingBlog}
            >
              {isGenerating ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Generate Blog'
              )}
            </button>
          </div>
        </div>

        {hasContent || isStreamingBlog ? (
          <div className="space-y-4">
            <PortableTextEditor
              content={displayContent}
              onChange={handleContentChange}
              isStreaming={isStreamingBlog}
              streamingContent={streamingBlogContent}
              readOnly={false}
            />
            
            {hasContent && !isStreamingBlog && (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">No blog content generated yet.</p>
            <div className="flex gap-2 justify-center">
              {onGenerateStreaming && (
                <button
                  className="btn btn-secondary"
                  onClick={onGenerateStreaming}
                  disabled={isGenerating || isStreamingBlog}
                >
                  {isStreamingBlog ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Streaming...
                    </>
                  ) : (
                    'Generate with Streaming'
                  )}
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={onGenerate}
                disabled={isGenerating || isStreamingBlog}
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Blog Content'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
