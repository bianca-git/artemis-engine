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
      // Enhanced regex for better CSV parsing with quoted fields
      const values = line.match(/("(?:[^"]|"")*"|[^",]*)/g) || [];
      
      return headers.reduce((obj, header, i) => {
        const rawValue = values[i] || '';
        
        // Handle quoted values and sanitize for XSS prevention
        let cleanValue = rawValue.startsWith('"') && rawValue.endsWith('"')
          ? rawValue.slice(1, -1).replace(/""/g, '"')
          : rawValue;
        
        // Basic XSS prevention - escape HTML tags
        cleanValue = cleanValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
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
 * Truncate text at word/sentence boundary to avoid cutting off mid-word
 */
export const truncateAtBoundary = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  
  // Find the last word boundary (space, period, or other punctuation)
  const lastBoundary = Math.max(
    truncated.lastIndexOf(' '),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('\n')
  );
  
  // If we found a boundary, use it; otherwise use the full truncated text
  return lastBoundary > maxLength * 0.7 ? truncated.substring(0, lastBoundary) : truncated;
};
