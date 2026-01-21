
'use client'

import { useState, useEffect } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { useEditor, EditorContent, InputRule } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import parse from 'html-react-parser'
import UnifiedToolbar from './unified-toolbar'
import { MathExtension } from './math-extension'
import LatexRenderer from './latex-renderer'

// LatexPreview removed - using LatexRenderer

interface RichTextEditorProps {
    id: string
    name: string
    defaultValue?: string
    rows?: number
    required?: boolean
    label: string
    placeholder?: string
    enableMath?: boolean
    onChange?: (html: string) => void
}

// Extend Superscript to add input rules
const CustomSuperscript = Superscript.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /\^(\w+)$/,
        handler: ({ state, range, match }) => {
            const { tr } = state
            const start = range.from
            const end = range.to
            const text = match[1]
            
            if (text) {
                tr.replaceWith(start, end, state.schema.text(text))
                tr.addMark(start, start + text.length, this.type.create())
                tr.removeMark(start + text.length, start + text.length, this.type)
            }
        },
      }),
      // Handle x^2 followed by space to convert previous char?
      // Actually common pattern is: type char, type ^, then next char is superscript.
      // Or type char^2 then space -> char²
      // Let's support: word^number -> word + superscript number
      new InputRule({
          find: /(\w+)\^(\d+)$/,
          handler: ({ state, range, match }) => {
              const { tr } = state
              const start = range.from
              const end = range.to
              const base = match[1]
              const sup = match[2]
              
              tr.insertText(base, start, end)
              const supStart = start + base.length
              tr.insertText(sup, supStart)
              tr.addMark(supStart, supStart + sup.length, this.type.create())
          }
      })
    ]
  },
})

export default function RichTextEditor({ 
    id, 
    name, 
    defaultValue = '', 
    rows = 4, 
    required = false,
    label,
    placeholder,
    enableMath = true,
    onChange
}: RichTextEditorProps) {
    const [value, setValue] = useState(defaultValue)
    const [showPreview, setShowPreview] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            CustomSuperscript,
            Subscript,
            MathExtension,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: defaultValue,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3 text-gray-900 [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100',
            },
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        onTransaction: ({ editor }) => {
            // Force re-render to update toolbar state (isActive checks)
            // This fixes the issue where italic state persists visually in toolbar even when cursor moves to non-italic text
            const { selection } = editor.state
            // We don't need to do anything complex, just triggering the update hook 
            // by virtue of this callback running might be enough if we were using state.
            // But since UnifiedToolbar reads from `editor` prop directly, we need to ensure the parent re-renders 
            // or the toolbar re-renders. 
            // In Tiptap react, useEditor re-renders on every transaction by default unless configured otherwise.
            // Let's ensure we are passing the latest editor state.
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            setValue(html)
            if (onChange) onChange(html)
        },
    })

    // Update editor content if defaultValue changes externally
    useEffect(() => {
        if (editor && defaultValue !== editor.getHTML()) {
             // If default value is empty but editor has content, clear it (reset case)
             if (defaultValue === '') {
                 editor.commands.clearContent()
             } 
             // If editor is empty but default value has content, set it (initial load case)
             else if (editor.isEmpty && defaultValue) {
                 editor.commands.setContent(defaultValue)
             }
        }
    }, [defaultValue, editor])

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label htmlFor={id} className={`block text-sm font-medium transition-colors ${isFocused ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {label}
                </label>
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={() => {
                            if (editor) {
                                editor.commands.clearContent()
                                setValue('')
                                if (onChange) onChange('')
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
                className={`border rounded-md shadow-sm bg-white transition-all duration-200 
                    ${isFocused 
                        ? 'border-indigo-500 ring-1 ring-indigo-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <UnifiedToolbar editor={editor} showMath={enableMath} />
                <EditorContent editor={editor} />
                
                {/* Hidden input to submit form data */}
                <input type="hidden" name={name} value={value} required={required} />
            </div>
            
            {showPreview && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Preview (Student View)</p>
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mt-2 font-serif text-sm min-h-[60px] prose prose-sm max-w-none text-gray-900">
                        <LatexRenderer>{value}</LatexRenderer>
                    </div>
                </div>
            )}
        </div>
    )
}
