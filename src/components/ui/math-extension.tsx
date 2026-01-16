
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import MathInput from './math-input'
import { useState, useRef, useEffect } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

// Component to render the Math Node
const MathComponent = ({ node, updateAttributes, getPos }: any) => {
  const [isEditing, setIsEditing] = useState(false)
  const [latex, setLatex] = useState(node.attrs.latex || '')

  const handleUpdate = (newLatex: string) => {
    setLatex(newLatex)
    updateAttributes({ latex: newLatex })
  }

  // If clicked, enable editing
  // We use a wrapper that handles the click
  return (
    <NodeViewWrapper className="inline-block mx-1 align-middle">
      {isEditing ? (
        <div className="relative z-50 min-w-[100px]">
           <MathInput 
              value={latex} 
              onChange={handleUpdate}
              className="border border-indigo-500 shadow-lg !min-h-[40px] !p-1"
              onInit={(mf) => {
                  setTimeout(() => mf.focus(), 50)
              }}
           />
           {/* Overlay to close on click outside - simplified */}
           <div 
             className="fixed inset-0 z-[-1]" 
             onClick={(e) => {
                 e.stopPropagation()
                 setIsEditing(false)
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
