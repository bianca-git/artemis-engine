import React, { useState, useCallback } from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { Edit3, Save, X } from 'lucide-react';

interface PortableTextEditorProps {
  content: PortableTextBlock[];
  onChange: (content: PortableTextBlock[]) => void;
  isStreaming?: boolean;
  streamingContent?: string;
  className?: string;
  readOnly?: boolean;
}

const PortableTextEditor = ({ 
  content, 
  onChange,
  isStreaming = false,
  streamingContent = '',
  className = '',
  readOnly = false
}: PortableTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');

  // Ensure a return in all code paths
  // (rest of the component code remains unchanged)

  // Custom components for rendering Portable Text
  const components = {
    block: {
      h1: ({ children }: any) => (
        <h1 className="text-3xl font-bold mb-4 text-primary">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-bold mb-3 text-secondary">{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xl font-bold mb-2">{children}</h3>
      ),
      normal: ({ children }: any) => (
        <p className="mb-4 leading-relaxed">{children}</p>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
      ),
      number: ({ children }: any) => (
        <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }: any) => (
        <li className="ml-4">{children}</li>
      ),
      number: ({ children }: any) => (
        <li className="ml-4">{children}</li>
      ),
    },
    marks: {
      strong: ({ children }: any) => (
        <strong className="font-bold text-primary">{children}</strong>
      ),
      em: ({ children }: any) => (
        <em className="italic">{children}</em>
      ),
      link: ({ value, children }: any) => (
        <a 
          href={value.href} 
          className="text-primary hover:text-primary-focus underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
    },
  };

  // Convert Portable Text blocks to plain text for editing
  // Type guard to check if a child is a span with a text property
  function isSpanWithText(child: any): child is { text: string } {
    return child && child._type === 'span' && typeof child.text === 'string';
  }

  const convertToPlainText = useCallback((blocks: PortableTextBlock[]): string => {
    return blocks.map(block => {
      if (block.style === 'h1' || block.style === 'h2' || block.style === 'h3') {
        const prefix = '#'.repeat(parseInt(block.style.charAt(1)));
        const text = block.children
          .filter(isSpanWithText)
          .map(child => child.text)
          .join('');
        return `${prefix} ${text}`;
      }
      return block.children
        .filter(isSpanWithText)
        .map(child => child.text)
        .join('');
    }).join('\n\n');
  }, []);

  // Convert plain text to Portable Text blocks
  const convertToPortableText = useCallback((text: string): PortableTextBlock[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const blocks: PortableTextBlock[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      let style: 'normal' | 'h1' | 'h2' | 'h3' = 'normal';
      let cleanText = trimmedLine;
      
      // Detect markdown-style headers
      if (trimmedLine.startsWith('### ')) {
        style = 'h3';
        cleanText = trimmedLine.substring(4);
      } else if (trimmedLine.startsWith('## ')) {
        style = 'h2';
        cleanText = trimmedLine.substring(3);
      } else if (trimmedLine.startsWith('# ')) {
        style = 'h1';
        cleanText = trimmedLine.substring(2);
      }
      
      blocks.push({
        _type: 'block',
        _key: `block-${index}`,
        style,
        children: [
          {
            _type: 'span',
            _key: `span-${index}`,
            text: cleanText,
            marks: []
          }
        ]
      });
    });
    
    return blocks;
  }, []);

  // Handle starting edit mode
  const handleStartEdit = useCallback(() => {
    setEditingText(convertToPlainText(content));
    setIsEditing(true);
  }, [content, convertToPlainText]);

  // Handle saving changes
  const handleSave = useCallback(() => {
    const newBlocks = convertToPortableText(editingText);
    onChange(newBlocks);
    setIsEditing(false);
  }, [editingText, convertToPortableText, onChange]);

  // Handle canceling edit
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditingText('');
  }, []);

  // Show streaming content if currently streaming
  if (isStreaming && streamingContent) {
    const streamBlocks = convertToPortableText(streamingContent);
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">Generating content...</span>
            <span className="loading loading-dots loading-sm"></span>
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-base-50 dark:bg-base-200 min-h-40">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <PortableText 
              value={streamBlocks} 
              components={components}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show editing interface
  if (isEditing) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-secondary">Editing content (Markdown supported)</span>
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
        <textarea
          className="textarea textarea-bordered w-full min-h-96 font-mono text-sm"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          placeholder="Enter your content here. Use # for headers (# H1, ## H2, ### H3)"
          autoFocus
        />
        <div className="text-xs text-neutral-500 mt-2">
          Tip: Use # for H1, ## for H2, ### for H3. Separate paragraphs with empty lines.
        </div>
      </div>
    );
  }

  // Show read-only or editable view
  return (
    <div className={className}>
      {!readOnly && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-secondary">Content</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleStartEdit}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        </div>
      )}
      
      <div className="border rounded-lg p-6 bg-base-50 dark:bg-base-200 min-h-40">
        {content && content.length > 0 ? (
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <PortableText 
              value={content} 
              components={components}
            />
          </div>
        ) : (
          <div className="text-neutral-500 text-center py-8">
            No content yet. {!readOnly && 'Click Generate Blog to create content.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortableTextEditor;