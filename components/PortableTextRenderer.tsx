import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface PortableTextRendererProps {
  content: PortableTextBlock[];
}

const PortableTextRenderer: React.FC<PortableTextRendererProps> = ({ content }) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-base-300 rounded-xl shadow-lg border border-base-300 p-8">
      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        <PortableText value={content} />
      </div>
    </div>
  );
};

export default PortableTextRenderer;