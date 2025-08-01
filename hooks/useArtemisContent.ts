export function useArtemisContent() {
    // --- Content Generation API Handlers ---
    const amplifyTopic = async (keyword: string) => {
        const response = await fetch("/api/amplify-topic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword }),
        });
        return response.json();
    };

    const generateSeo = async (topic: any) => {
        const response = await fetch("/api/generate-seo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
        });
        return response.json();
    };

    const generateBlog = async (topic: any, onChunk?: (chunk: string) => void, onComplete?: (data: any) => void) => {
        const response = await fetch("/api/generate-blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
        });

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            
                            if (data.isComplete) {
                                onComplete?.(data);
                                return {
                                    content: data.fullContent || fullContent,
                                    portableText: data.portableText || []
                                };
                            } else {
                                fullContent += data.content;
                                onChunk?.(data.content);
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return {
            content: fullContent,
            portableText: []
        };
    };

    const generateVisual = async (prompt: string, scene: string, bodyLanguage: string) => {
        const response = await fetch("/api/generate-visual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, scene, bodyLanguage }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate visual descriptions.');
        }
        return response.json();
    };

    const generateSocial = async (blog: string) => {
        const response = await fetch("/api/generate-social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blog }),
        });
        return response.json();
    };

    const publishToCms = async (payload: any) => {
        const response = await fetch("/api/publish-cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return response.json();
    };
    
    const publishVisuals = async (descriptions: any[]) => {
        const response = await fetch('/api/publish-visuals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptions }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to publish visual descriptions.');
        }
        return response.json();
    };

    return {
        amplifyTopic,
        generateSeo,
        generateBlog,
        generateVisual,
        generateSocial,
        publishToCms,
        publishVisuals,
    };
}
