import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface PortableTextRendererProps {
  content: PortableTextBlock[];
  className?: string;
}

const PortableTextRenderer: React.FC<PortableTextRendererProps> = ({ 
  content, 
  className = '' 
}) => {
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

  if (!content || !Array.isArray(content)) {
    return <div className="text-neutral-500">No content to display</div>;
  }

  return (
    <div className={`prose prose-lg prose-slate dark:prose-invert max-w-none ${className}`}>
      <PortableText 
        value={content} 
        components={components}
      />
    </div>
  );
};

export default PortableTextRenderer;