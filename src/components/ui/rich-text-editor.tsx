
'use client'

import { useState, useRef, useEffect } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

// LaTeX Preview Component
const LatexPreview = ({ content }: { content: string }) => {
    if (!content) return null

    const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g
    const parts = content.split(regex)

    const renderText = (text: string) => {
        // Parse HTML tags for Bold, Italic, Underline
        const htmlRegex = /(<b>[\s\S]*?<\/b>|<i>[\s\S]*?<\/i>|<u>[\s\S]*?<\/u>)/g
        const segments = text.split(htmlRegex)

        return segments.map((seg, i) => {
            if (seg.startsWith('<b>') && seg.endsWith('</b>')) {
                return <b key={i}>{seg.slice(3, -4)}</b>
            }
            if (seg.startsWith('<i>') && seg.endsWith('</i>')) {
                return <i key={i}>{seg.slice(3, -4)}</i>
            }
            if (seg.startsWith('<u>') && seg.endsWith('</u>')) {
                return <u key={i}>{seg.slice(3, -4)}</u>
            }
            
            return seg.split('\n').map((line, j) => (
                <span key={`${i}-${j}`}>
                    {line}
                    {j < seg.split('\n').length - 1 && <br />}
                </span>
            ))
        })
    }

    return (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mt-2 font-serif text-sm min-h-[60px]">
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    return <BlockMath key={index} math={part.slice(2, -2)} />
                } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                    return <BlockMath key={index} math={part.slice(2, -2)} />
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    return <InlineMath key={index} math={part.slice(1, -1)} />
                } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                    return <InlineMath key={index} math={part.slice(2, -2)} />
                } else {
                    return <span key={index}>{renderText(part)}</span>
                }
            })}
        </div>
    )
}

interface RichTextEditorProps {
    id: string
    name: string
    defaultValue?: string
    rows?: number
    required?: boolean
    label: string
    placeholder?: string
}

export default function RichTextEditor({ 
    id, 
    name, 
    defaultValue = '', 
    rows = 4, 
    required = false,
    label,
    placeholder 
}: RichTextEditorProps) {
    const [value, setValue] = useState(defaultValue)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [showPreview, setShowPreview] = useState(false)

    // Update value if defaultValue changes (e.g. loading edit form)
    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const selection = text.substring(start, end)
        
        const newText = text.substring(0, start) + before + selection + after + text.substring(end)
        setValue(newText)
        
        // Need to wait for render to set cursor position
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + before.length + selection.length + after.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    const tools = [
        { label: 'B', title: 'Bold', action: () => insertText('<b>', '</b>'), className: 'font-bold' },
        { label: 'I', title: 'Italic', action: () => insertText('<i>', '</i>'), className: 'italic' },
        { label: 'U', title: 'Underline', action: () => insertText('<u>', '</u>'), className: 'underline' },
        { separator: true },
        { label: 'x²', title: 'Superscript', action: () => insertText('^{', '}') },
        { label: 'x₂', title: 'Subscript', action: () => insertText('_{', '}') },
        { label: '√x', title: 'Square Root', action: () => insertText('\\sqrt{', '}') },
        { label: 'a/b', title: 'Fraction', action: () => insertText('\\frac{', '}{}') },
        { separator: true },
        { label: 'π', title: 'Pi', action: () => insertText('\\pi ') },
        { label: 'θ', title: 'Theta', action: () => insertText('\\theta ') },
        { label: '≤', title: 'Less or Equal', action: () => insertText('\\le ') },
        { label: '≥', title: 'Greater or Equal', action: () => insertText('\\ge ') },
        { label: '≠', title: 'Not Equal', action: () => insertText('\\ne ') },
        { label: '≈', title: 'Approx', action: () => insertText('\\approx ') },
        { separator: true },
        { label: '$...$', title: 'Inline Math', action: () => insertText('\\( ', ' \\)') },
    ]

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
                <button 
                    type="button" 
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
            </div>

            <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                    {tools.map((tool, idx) => (
                        tool.separator ? (
                            <div key={idx} className="w-px h-4 bg-gray-300 mx-1" />
                        ) : (
                            <button
                                key={idx}
                                type="button"
                                onClick={tool.action}
                                className={`px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-black hover:shadow-sm rounded transition-colors ${tool.className || ''}`}
                                title={tool.title}
                            >
                                {tool.label}
                            </button>
                        )
                    ))}
                </div>

                <textarea
                    id={id}
                    name={name}
                    ref={textareaRef}
                    rows={rows}
                    required={required}
                    className="block w-full p-3 border-0 focus:ring-0 sm:text-sm resize-y min-h-[100px] text-gray-900 placeholder:text-gray-400"
                    placeholder={placeholder || "Type here... Use the toolbar for math symbols."}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            
            {showPreview && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Preview</p>
                    <LatexPreview content={value} />
                </div>
            )}
        </div>
    )
}
