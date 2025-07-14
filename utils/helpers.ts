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

export const parseCsvData = (text: string) => {
  if (!text) return [];
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    // Regex to handle basic CSV with quoted fields
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    return headers.reduce((obj, header, i) => {
      const rawValue = values[i] || '';
      obj[header] = rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1).replace(/""/g, '"')
        : rawValue;
      return obj;
    }, {} as Record<string, string>);
  });
  return data;
};
