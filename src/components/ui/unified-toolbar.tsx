'use client'

import { useEditorContext } from './editor-context'

export default function UnifiedToolbar() {
  const { activeEditor } = useEditorContext()

  // Helper to check if button should be disabled
  const isDisabled = !activeEditor || !activeEditor.isEditable

  // Helper for button classes
  const getButtonClass = (isActive: boolean = false) => {
    return `px-3 py-1.5 text-sm font-medium rounded transition-colors ${
      isActive 
        ? 'bg-indigo-100 text-indigo-700' 
        : isDisabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`
  }

  const handleAction = (action: () => void) => {
    if (!isDisabled) {
      action()
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm py-2 px-4 flex items-center gap-2 flex-wrap transition-all duration-200">
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

      {/* Script Group */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleSuperscript().run())}
          disabled={isDisabled || !activeEditor?.can().chain().focus().toggleSuperscript().run()}
          className={getButtonClass(activeEditor?.isActive('superscript'))}
          title="Superscript"
        >
          x²
        </button>
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleSubscript().run())}
          disabled={isDisabled || !activeEditor?.can().chain().focus().toggleSubscript().run()}
          className={getButtonClass(activeEditor?.isActive('subscript'))}
          title="Subscript"
        >
          x₂
        </button>
      </div>

      {/* Structure Group */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().toggleHeading({ level: 2 }).run())}
          className={getButtonClass(activeEditor?.isActive('heading', { level: 2 }))}
          disabled={isDisabled}
          title="Heading 2"
        >
          H2
        </button>
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

      {/* Special Group */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleAction(() => activeEditor?.chain().focus().insertContent('\\(  \\)').run())}
          className={getButtonClass()}
          disabled={isDisabled}
          title="Insert Math"
        >
          Math
        </button>
      </div>
      
      {/* Active Field Indicator (Optional) */}
      {!activeEditor && (
        <div className="ml-auto text-xs text-gray-400 italic">
          Select a text field to edit formatting
        </div>
      )}
    </div>
  )
}
