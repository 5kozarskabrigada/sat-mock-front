
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

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Bold (Ctrl+B)"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`px-2 py-1 text-xs italic rounded transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Italic (Ctrl+I)"
            >
                I
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={`px-2 py-1 text-xs underline rounded transition-colors ${editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Underline (Ctrl+U)"
            >
                U
            </button>
            
            <div className="w-px h-4 bg-gray-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                disabled={!editor.can().chain().focus().toggleSuperscript().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('superscript') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Superscript (x²)"
            >
                x²
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                disabled={!editor.can().chain().focus().toggleSubscript().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('subscript') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Subscript (x₂)"
            >
                x₂
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Heading"
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Bullet List"
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                title="Numbered List"
            >
                1. List
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1" />
            
            <button
                type="button"
                onClick={() => editor.chain().focus().insertContent('\\(  \\)').run()}
                className="px-2 py-1 text-xs font-mono rounded transition-colors text-gray-700 hover:bg-white hover:shadow-sm"
                title="Insert Inline Math ($...$)"
            >
                Math
            </button>
        </div>
    )
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
        },
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        },
    })

    // Update editor content if defaultValue changes externally
    useEffect(() => {
        if (editor && defaultValue !== editor.getHTML()) {
             // Only update if content is significantly different to avoid cursor jumps
             // For simplicity in this admin context, we can trust defaultValue updates usually mean data load
             if (editor.getText() === '' && defaultValue) {
                 editor.commands.setContent(defaultValue)
             }
        }
    }, [defaultValue, editor])

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
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

            <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <MenuBar editor={editor} />
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
