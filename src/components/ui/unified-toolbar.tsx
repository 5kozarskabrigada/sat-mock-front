'use client'

import { Editor } from '@tiptap/react'

export default function UnifiedToolbar({ editor, showMath = true }: { editor: Editor | null, showMath?: boolean }) {
  // Helper to check if button should be disabled
  const isDisabled = !editor || !editor.isEditable
  const activeEditor = editor

  // Helper for button classes
  const getButtonClass = (isActive: boolean = false, isMath: boolean = false) => {
    return `px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center justify-center ${
      isActive 
        ? 'bg-indigo-100 text-indigo-700' 
        : isDisabled
          ? 'text-gray-300 cursor-not-allowed'
          : isMath 
            ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent font-serif'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`
  }

  const handleAction = (action: () => void) => {
    if (!isDisabled) {
      action()
    }
  }

  const insertMath = (latex: string) => {
    if (activeEditor && !isDisabled) {
        // Insert Math Node
        activeEditor.chain().focus().insertContent({
            type: 'mathComponent',
            attrs: { latex }
        }).run()
    }
  }

  const insertMathNode = () => {
      if (activeEditor && !isDisabled) {
          activeEditor.chain().focus().insertContent({
              type: 'mathComponent',
              attrs: { latex: '' }
          }).run()
      }
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm py-2 px-4 flex items-center gap-2 flex-wrap transition-all duration-200">
      <div className="flex items-center gap-1 mr-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Formatting</span>
      </div>

      {/* Text Style Group */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleBold().run())}
          disabled={isDisabled || !activeEditor?.can().chain().focus().toggleBold().run()}
          className={getButtonClass(activeEditor?.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleItalic().run())}
          disabled={isDisabled || !activeEditor?.can().chain().focus().toggleItalic().run()}
          className={getButtonClass(activeEditor?.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleUnderline().run())}
          disabled={isDisabled || !activeEditor?.can().chain().focus().toggleUnderline().run()}
          className={getButtonClass(activeEditor?.isActive('underline'))}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>

      {/* Structure Group */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleBulletList().run())}
          className={getButtonClass(activeEditor?.isActive('bulletList'))}
          disabled={isDisabled}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleOrderedList().run())}
          className={getButtonClass(activeEditor?.isActive('orderedList'))}
          disabled={isDisabled}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {showMath && (
        <>
            {/* Math Group */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
                <button
                type="button"
                onClick={insertMathNode}
                className={getButtonClass(false, true)}
                disabled={isDisabled}
                title="Insert Math Formula"
                >
                Formula
                </button>
                <button
                    type="button"
                    onClick={() => insertMath('\\frac{}{}')}
                    className={getButtonClass(false, true)}
                    disabled={isDisabled}
                    title="Fraction"
                >
                    a/b
                </button>
                <button
                    type="button"
                    onClick={() => insertMath('\\sqrt{}')}
                    className={getButtonClass(false, true)}
                    disabled={isDisabled}
                    title="Square Root"
                >
                    √
                </button>
                <button
                    type="button"
                    onClick={() => insertMath('^{}')}
                    className={getButtonClass(false, true)}
                    disabled={isDisabled}
                    title="Power"
                >
                    xⁿ
                </button>
            </div>

            {/* Greek/Symbols Group */}
            <div className="flex items-center gap-1">
                <button onClick={() => insertMath('\\pi')} className={getButtonClass(false, true)} disabled={isDisabled}>π</button>
                <button onClick={() => insertMath('\\theta')} className={getButtonClass(false, true)} disabled={isDisabled}>θ</button>
                <button onClick={() => insertMath('\\le')} className={getButtonClass(false, true)} disabled={isDisabled}>≤</button>
                <button onClick={() => insertMath('\\ge')} className={getButtonClass(false, true)} disabled={isDisabled}>≥</button>
                <button onClick={() => insertMath('\\ne')} className={getButtonClass(false, true)} disabled={isDisabled}>≠</button>
            </div>
        </>
      )}
      
      {/* Active Field Indicator (Optional) */}
    </div>
  )
}
