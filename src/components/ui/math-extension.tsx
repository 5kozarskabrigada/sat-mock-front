
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import MathInput from './math-input'
import { useState, useRef, useEffect } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { useEditorContext } from './editor-context'

// Component to render the Math Node
const MathComponent = ({ node, updateAttributes, getPos }: any) => {
  const [isEditing, setIsEditing] = useState(false)
  const [latex, setLatex] = useState(node.attrs.latex || '')
  
  // Try to get context, but don't crash if used outside provider (e.g. tests)
  let setActiveMathField: ((field: any) => void) | undefined
  try {
      const context = useEditorContext()
      setActiveMathField = context.setActiveMathField
  } catch (e) {
      // No context available
  }

  const handleUpdate = (newLatex: string) => {
    setLatex(newLatex)
    updateAttributes({ latex: newLatex })
  }

  // Handle alignment and display mode
  const toggleAlign = () => {
      const newAlign = node.attrs.align === 'center' ? 'left' : 'center'
      updateAttributes({ align: newAlign, display: newAlign === 'center' ? 'block' : 'inline' })
  }

  // Handle focus tracking
  useEffect(() => {
    if (!isEditing && setActiveMathField) {
        setActiveMathField(null)
    }
  }, [isEditing, setActiveMathField])

  // If clicked, enable editing
  // We use a wrapper that handles the click
  return (
    <NodeViewWrapper className={`inline-block mx-1 align-middle ${node.attrs.align === 'center' ? 'w-full text-center my-2' : ''}`}>
      {isEditing ? (
        <div className={`relative z-50 min-w-[100px] ${node.attrs.align === 'center' ? 'inline-block' : ''}`}>
           <div className="absolute -top-8 left-0 flex gap-1 bg-white border shadow-sm rounded p-1 z-50">
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleAlign() }}
                    className={`px-2 py-0.5 text-xs rounded ${node.attrs.align === 'center' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                >
                    {node.attrs.align === 'center' ? 'Center' : 'Left'}
                </button>
           </div>
           <MathInput 
              value={latex} 
              onChange={handleUpdate}
              className={`border border-indigo-500 shadow-lg !min-h-[40px] !p-1 ${node.attrs.align === 'center' ? 'text-center' : ''}`}
              onInit={(mf) => {
                  setTimeout(() => {
                      mf.focus()
                      if (setActiveMathField) setActiveMathField(mf)
                  }, 50)
              }}
           />
           {/* Overlay to close on click outside - simplified */}
           <div 
             className="fixed inset-0 z-[-1]" 
             onClick={(e) => {
                 e.stopPropagation()
                 setIsEditing(false)
                 if (setActiveMathField) setActiveMathField(null)
             }} 
           />
        </div>
      ) : (
        <span 
            className="cursor-pointer hover:bg-indigo-50 px-1 rounded transition-colors border border-transparent hover:border-indigo-200"
            onClick={() => setIsEditing(true)}
            title="Click to edit formula"
        >
            {latex ? <InlineMath math={latex} /> : <span className="text-gray-400 italic text-xs">[Formula]</span>}
        </span>
      )}
    </NodeViewWrapper>
  )
}

export const MathExtension = Node.create({
  name: 'mathComponent',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
      display: {
        default: 'inline',
      },
      align: {
        default: 'left',
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'math-component',
      },
      // Also try to parse standard latex delimiters if pasted?
      // Simple regex parser for input rules is better
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['math-component', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathComponent)
  },
  
  // Input Rule to convert $...$ to math node
  addInputRules() {
      return [
        // Standard $...$ or \(...\) is hard to match perfectly with simple InputRule regex across chars
        // But we can try matching simple formulas or a trigger like '$$'
      ]
  }
})
