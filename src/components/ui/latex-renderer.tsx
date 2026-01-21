'use client'

import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import parse from 'html-react-parser'

const decodeHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    try {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    } catch (e) {
        return html;
    }
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
