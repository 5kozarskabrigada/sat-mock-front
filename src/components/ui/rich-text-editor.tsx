
'use client'

import { useState, useEffect } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import parse from 'html-react-parser'
import { useEditorContext } from './editor-context'

// LaTeX Preview Component
const LatexPreview = ({ content }: { content: string }) => {
    if (!content) return null

    // If content contains standard LaTeX delimiters, we try to parse them
    // Note: This simple parser handles LaTeX mixed with HTML from Tiptap
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
        }
    }

    return (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mt-2 font-serif text-sm min-h-[60px] prose prose-sm max-w-none text-gray-900">
            {parse(content, options)}
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
    const [showPreview, setShowPreview] = useState(false)
    const { setActiveEditor, setActiveFieldId, activeFieldId } = useEditorContext()

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: defaultValue,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3 text-gray-900',
            },
            handleDOMEvents: {
                focus: (view, event) => {
                    // Update context when focused
                    // We need to pass the editor instance, but view.props.editor is internal
                    // We can use the 'editor' returned by useEditor, but we need to ensure it's up to date?
                    // Actually, onFocus is called, we can set it then.
                    return false
                }
            }
        },
        onFocus: ({ editor }) => {
            setActiveEditor(editor)
            setActiveFieldId(id)
        },
        onBlur: ({ editor }) => {
            // Optional: we can clear it or leave it. 
            // Leaving it allows clicking buttons without re-focusing first (though buttons take focus usually)
            // But usually clicking a toolbar button that is NOT part of the editor might blur the editor.
            // Tiptap's chain().focus() handles refocusing.
            // If we clear activeEditor here, clicking the toolbar might fail if the click event happens after blur.
            // So let's NOT clear it immediately.
        },
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        },
    })

    // Update editor content if defaultValue changes externally
    useEffect(() => {
        if (editor && defaultValue !== editor.getHTML()) {
             if (editor.getText() === '' && defaultValue) {
                 editor.commands.setContent(defaultValue)
             }
        }
    }, [defaultValue, editor])

    const isActive = activeFieldId === id

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label htmlFor={id} className={`block text-sm font-medium transition-colors ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {label}
                    {isActive && <span className="ml-2 text-xs font-normal text-indigo-500">• Editing</span>}
                </label>
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={() => {
                            if (editor) {
                                editor.commands.clearContent()
                                setValue('')
                            }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                        Clear
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                </div>
            </div>

            <div 
                className={`border rounded-md shadow-sm overflow-hidden bg-white transition-all duration-200 
                    ${isActive 
                        ? 'border-indigo-500 ring-1 ring-indigo-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                {/* Internal MenuBar removed in favor of UnifiedToolbar */}
                <EditorContent editor={editor} />
                
                {/* Hidden input to submit form data */}
                <input type="hidden" name={name} value={value} required={required} />
            </div>
            
            {showPreview && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Preview (Student View)</p>
                    <LatexPreview content={value} />
                </div>
            )}
        </div>
    )
}
