'use client'

import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import parse from 'html-react-parser'

const decodeHtml = (html: string) => {
    let decoded = html;
    // Handle multiple levels of escaping (e.g., &amp;lt;p&amp;gt; -> &lt;p&gt; -> <p>)
    let previous;
    do {
        previous = decoded;
        decoded = decoded
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
    } while (decoded !== previous && (decoded.includes('&lt;') || decoded.includes('&gt;') || decoded.includes('&amp;')));
    
    return decoded;
}

export default function LatexRenderer({ children, className = '' }: { children: string, className?: string }) {
    if (!children) return null;
    
    // Attempt to decode if it looks like escaped HTML
    let content = children;
    if (content.includes('&lt;') || content.includes('&gt;')) {
        content = decodeHtml(content);
    }

    const options = {
        replace: (domNode: any) => {
            if (domNode.type === 'text') {
                const text = domNode.data
                const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g
                const parts = text.split(regex)
                
                if (parts.length > 1) {
                    return (
                        <>
                            {parts.map((part: string, index: number) => {
                                if (part.startsWith('$$') && part.endsWith('$$')) {
                                    return <BlockMath key={index} math={part.slice(2, -2)} />
                                } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                                    return <BlockMath key={index} math={part.slice(2, -2)} />
                                } else if (part.startsWith('$') && part.endsWith('$')) {
                                    return <InlineMath key={index} math={part.slice(1, -1)} />
                                } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                                    return <InlineMath key={index} math={part.slice(2, -2)} />
                                } else {
                                    return <span key={index}>{part}</span>
                                }
                            })}
                        </>
                    )
                }
            }

            if (domNode.type === 'tag' && domNode.name === 'math-component') {
                const latex = domNode.attribs?.latex
                const display = domNode.attribs?.display
                if (latex) {
                    if (display === 'block') {
                        return <BlockMath math={latex} />
                    }
                    return <InlineMath math={latex} />
                }
            }
        }
    }

    return (
        <div className={`latex-content ${className}`}>
            {parse(content, options)}
        </div>
    );
}
