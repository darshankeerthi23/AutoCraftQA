'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    const [sanitizedContent, setSanitizedContent] = useState('');

    useEffect(() => {
        // Sanitize on client-side to ensure mismatch doesn't occur during hydration
        // and to use DOMPurify in browser environment
        setSanitizedContent(DOMPurify.sanitize(content));
    }, [content]);

    return (
        <div
            className={`prose dark:prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}
