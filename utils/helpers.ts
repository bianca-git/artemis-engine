// Utility functions for Artemis

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const calculateReadTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Memoization cache for CSV parsing
const csvParseCache = new Map<string, Record<string, string>[]>();

/**
 * Optimized CSV parser with memoization and better performance
 * Prevents re-parsing the same data and includes input sanitization
 */
export const parseCsvData = (text: string): Record<string, string>[] => {
  if (!text?.trim()) return [];
  
  // Check cache first for performance
  if (csvParseCache.has(text)) {
    return csvParseCache.get(text)!;
  }

  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  try {
    // Sanitize and parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/[<>]/g, ''));
    
    // Parse data rows with improved CSV handling
    const data = lines.slice(1).map((line, lineIndex) => {
      // More robust CSV parsing that handles quoted fields with commas
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            // Handle escaped quotes ("")
            currentValue += '"';
            i += 2;
          } else {
            // Toggle quote state
            insideQuotes = !insideQuotes;
            i++;
          }
        } else if (char === ',' && !insideQuotes) {
          // Field separator found outside quotes
          values.push(currentValue);
          currentValue = '';
          i++;
        } else {
          currentValue += char;
          i++;
        }
      }
      
      // Add the last value
      values.push(currentValue);
      
      return headers.reduce((obj, header, i) => {
        const rawValue = values[i] || '';
        
        // Basic XSS prevention - escape HTML tags
        const cleanValue = rawValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        obj[header] = cleanValue;
        return obj;
      }, {} as Record<string, string>);
    });

    // Cache the result
    csvParseCache.set(text, data);
    
    return data;
  } catch (error) {
    console.error('CSV parsing error:', error);
    return [];
  }
};

/**
 * Clear CSV parse cache when needed
 */
export const clearCsvCache = () => {
  csvParseCache.clear();
};

/**
 * Minimum boundary ratio for truncation - only use boundary if it's at least this ratio of maxLength
 */
const MIN_BOUNDARY_RATIO = 0.5;

/**
 * Truncate text at word/sentence boundary to avoid cutting off mid-word
 */
export function truncateAtBoundary(text: string, max: number): string {
  if (!text || text.length <= max) return text || '';
  const slice = text.slice(0, max);
  const lastBreak = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '), slice.lastIndexOf(' '));
  return (lastBreak > max * 0.6 ? slice.slice(0, lastBreak) : slice).trim();
}

/**
 * Convert Portable Text blocks to plain text for editing/copying
 */
export const portableTextToPlainText = (portableText: any[]): string => {
  if (!Array.isArray(portableText)) return '';
  
  return portableText
    .map(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children
          .map((child: any) => child.text || '')
          .join('');
        
        // Add appropriate spacing for different block styles
        switch (block.style) {
          case 'h1':
            return `# ${text}\n\n`;
          case 'h2':
            return `## ${text}\n\n`;
          case 'h3':
            return `### ${text}\n\n`;
          default:
            // Handle list items
            if (block.listItem === 'bullet') {
              return `• ${text}\n`;
            }
            return `${text}\n\n`;
        }
      }
      return '';
    })
    .join('')
    .trim();
};
