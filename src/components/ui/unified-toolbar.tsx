'use client'

import { Editor } from '@tiptap/react'
import { useState } from 'react'
import { useEditorContext } from './editor-context'

interface UnifiedToolbarProps {
  editor: Editor | null
  showMath?: boolean
}

export default function UnifiedToolbar({ editor, showMath = true }: UnifiedToolbarProps) {
  // Helper to check if button should be disabled
  const isDisabled = !editor || !editor.isEditable
  const activeEditor = editor
  
  let activeMathField: any = null
  try {
      const ctx = useEditorContext()
      activeMathField = ctx.activeMathField
  } catch (e) {
      // Ignore
  }

  const insertMath = (latex: string) => {
    if (activeMathField) {
        activeMathField.cmd(latex)
        activeMathField.focus()
    } else if (activeEditor && !isDisabled) {
      activeEditor.chain().focus().insertContent({
        type: 'mathComponent',
        attrs: { latex }
      }).run()
    }
  }

  // Helper for preventing focus loss on toolbar buttons
  const preventFocusLoss = (e: React.MouseEvent) => {
      e.preventDefault()
  }

  const insertMathNode = () => {
    if (activeEditor && !isDisabled) {
      activeEditor.chain().focus().insertContent({
        type: 'mathComponent',
        attrs: { latex: '', display: 'inline', align: 'left' }
      }).run()
    }
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm transition-all duration-200">
      
      {/* Primary Toolbar - Always Visible */}
      <div className="flex flex-wrap items-center gap-1 p-2">
        
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton
            onClick={() => activeEditor?.chain().focus().toggleBold().run()}
            isActive={activeEditor?.isActive('bold')}
            disabled={isDisabled}
            title="Bold (Ctrl+B)"
          >
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
            isActive={activeEditor?.isActive('italic')}
            disabled={isDisabled}
            title="Italic (Ctrl+I)"
          >
            <span className="italic font-serif">I</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => activeEditor?.chain().focus().toggleUnderline().run()}
            isActive={activeEditor?.isActive('underline')}
            disabled={isDisabled}
            title="Underline (Ctrl+U)"
          >
            <span className="underline">U</span>
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton
            onClick={() => activeEditor?.chain().focus().toggleBulletList().run()}
            isActive={activeEditor?.isActive('bulletList')}
            disabled={isDisabled}
            title="Bullet List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => activeEditor?.chain().focus().toggleOrderedList().run()}
            isActive={activeEditor?.isActive('orderedList')}
            disabled={isDisabled}
            title="Numbered List"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </ToolbarButton>
        </div>

        {/* Tables */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton
            onClick={() => (activeEditor?.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            disabled={isDisabled}
            title="Insert Table (3x3)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/><path d="M12 3v18"/></svg>
          </ToolbarButton>
          
          {activeEditor?.isActive('table') && (
            <>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).addColumnBefore().run()} disabled={isDisabled} title="Add Column Before">
                    <span className="text-[10px] font-bold">+Col←</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).addColumnAfter().run()} disabled={isDisabled} title="Add Column After">
                    <span className="text-[10px] font-bold">+Col→</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).deleteColumn().run()} disabled={isDisabled} title="Delete Column">
                    <span className="text-[10px] font-bold text-red-600">xCol</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).addRowBefore().run()} disabled={isDisabled} title="Add Row Before">
                    <span className="text-[10px] font-bold">+Row↑</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).addRowAfter().run()} disabled={isDisabled} title="Add Row After">
                    <span className="text-[10px] font-bold">+Row↓</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).deleteRow().run()} disabled={isDisabled} title="Delete Row">
                    <span className="text-[10px] font-bold text-red-600">xRow</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).mergeCells().run()} disabled={isDisabled} title="Merge Cells">
                    <span className="text-[10px] font-bold">Mrg</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => (activeEditor?.chain().focus() as any).deleteTable().run()} disabled={isDisabled} title="Delete Table">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </ToolbarButton>
            </>
          )}
        </div>

        {showMath && (
          <>
            {/* Math Entry */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
               <button
                  type="button"
                  onClick={insertMathNode}
                  disabled={isDisabled}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-sm font-semibold flex items-center gap-2 transition-colors"
                  title="Insert Interactive Formula Box"
                >
                  <span className="font-serif italic">f(x)</span> Insert Math
                </button>
            </div>

            {/* Quick Math Symbols - Basics */}
            <div className="flex items-center gap-0.5">
               <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\frac{}{}')} disabled={isDisabled} title="Fraction" isMath>
                  <span className="text-xs">½</span>
               </ToolbarButton>
               <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\sqrt{}')} disabled={isDisabled} title="Square Root" isMath>
                  √
               </ToolbarButton>
               <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\sqrt[3]{}')} disabled={isDisabled} title="N-th Root" isMath>
                  ∛
               </ToolbarButton>
               <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('^{}')} disabled={isDisabled} title="Superscript / Power" isMath>
                  xʸ
               </ToolbarButton>
               <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('_{}')} disabled={isDisabled} title="Subscript" isMath>
                  x_y
               </ToolbarButton>
               <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('|')} disabled={isDisabled} title="Absolute Value" isMath>
                  |x|
               </ToolbarButton>
            </div>
          </>
        )}
      </div>

      {/* Secondary Math Toolbar - Only if Math is enabled */}
      {showMath && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-t border-gray-200 text-xs">
           <div className="flex items-center gap-1 mr-2">
             <span className="text-[10px] uppercase font-bold text-gray-400 select-none">Trig</span>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\sin')} disabled={isDisabled} title="Sine" isMath className="w-auto px-2">sin</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\cos')} disabled={isDisabled} title="Cosine" isMath className="w-auto px-2">cos</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\tan')} disabled={isDisabled} title="Tangent" isMath className="w-auto px-2">tan</ToolbarButton>
           </div>
           
           <div className="w-px h-4 bg-gray-300 mx-1"></div>

           <div className="flex items-center gap-1 mr-2">
             <span className="text-[10px] uppercase font-bold text-gray-400 select-none">Rel</span>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\le')} disabled={isDisabled} title="Less than or equal" isMath>≤</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\ge')} disabled={isDisabled} title="Greater than or equal" isMath>≥</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\ne')} disabled={isDisabled} title="Not equal" isMath>≠</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\approx')} disabled={isDisabled} title="Approximately" isMath>≈</ToolbarButton>
           </div>

           <div className="w-px h-4 bg-gray-300 mx-1"></div>

           <div className="flex items-center gap-1 mr-2">
             <span className="text-[10px] uppercase font-bold text-gray-400 select-none">Sym</span>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\pi')} disabled={isDisabled} title="Pi" isMath>π</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\theta')} disabled={isDisabled} title="Theta" isMath>θ</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\infty')} disabled={isDisabled} title="Infinity" isMath>∞</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('^{\\circ}')} disabled={isDisabled} title="Degree" isMath>°</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('^{\\circ}C')} disabled={isDisabled} title="Celsius" isMath>°C</ToolbarButton>
           </div>

           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           
           <div className="flex items-center gap-1">
             <span className="text-[10px] uppercase font-bold text-gray-400 select-none">Geo</span>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\angle')} disabled={isDisabled} title="Angle" isMath>∠</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\triangle')} disabled={isDisabled} title="Triangle" isMath>△</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\parallel')} disabled={isDisabled} title="Parallel" isMath>∥</ToolbarButton>
             <ToolbarButton onMouseDown={preventFocusLoss} onClick={() => insertMath('\\perp')} disabled={isDisabled} title="Perpendicular" isMath>⊥</ToolbarButton>
           </div>
        </div>
      )}
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
  isMath?: boolean
  className?: string
}

function ToolbarButton({ onClick, onMouseDown, isActive, disabled, children, title, isMath, className = '' }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onMouseDown}
      disabled={disabled}
      title={title}
      className={`
        min-w-[28px] h-7 px-1.5 rounded flex items-center justify-center text-sm transition-all
        ${isActive 
          ? 'bg-indigo-100 text-indigo-700 font-medium' 
          : disabled
            ? 'text-gray-300 cursor-not-allowed'
            : isMath
              ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 font-serif'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}
