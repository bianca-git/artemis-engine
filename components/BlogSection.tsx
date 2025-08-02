import React from 'react';
import { Copy, Download, Eye, Edit } from 'lucide-react';
import PortableTextRenderer from './PortableTextRenderer';
import type { PortableTextBlock } from '@portabletext/types';

interface BlogSectionProps {
  blog: string;
  blogPortableText: PortableTextBlock[] | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onBlogChange: (value: string) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  blog,
  blogPortableText,
  isGenerating,
  onGenerate,
  onCopy,
  onDownload,
  onBlogChange,
}) => {
  const [viewMode, setViewMode] = React.useState<'preview' | 'edit'>('preview');

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-primary">Generated Blog Content</h3>
          <div className="flex gap-2">
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === 'preview' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('preview')}
                disabled={!blogPortableText}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'edit' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('edit')}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Generate Blog'
              )}
            </button>
          </div>
        </div>

        {blog || blogPortableText ? (
          <div className="space-y-4">
            {viewMode === 'preview' && blogPortableText ? (
              <div className="border rounded-lg p-4 bg-base-50">
                <PortableTextRenderer 
                  content={blogPortableText}
                  className="prose-sm"
                />
              </div>
            ) : null}
            {viewMode === 'edit' ? (
              <div className="border rounded-lg p-4 bg-base-50">
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={10}
                  value={blog}
                  readOnly={isGenerating}
                  onChange={e => onBlogChange(e.target.value)}
                  placeholder="Edit your blog content here..."
                />
              </div>
            ) : null}
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={onCopy}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={onDownload}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">No blog content generated yet.</p>
            <button
              className="btn btn-primary"
              onClick={onGenerate}
              disabled={isGenerating}
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
        )}
      </div>
    </div>
  );
};

export default BlogSection;
