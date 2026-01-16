'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Editor } from '@tiptap/react'

interface EditorContextType {
  activeEditor: Editor | null
  setActiveEditor: (editor: Editor | null) => void
  activeFieldId: string | null
  setActiveFieldId: (id: string | null) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)

  return (
    <EditorContext.Provider 
      value={{ 
        activeEditor, 
        setActiveEditor,
        activeFieldId,
        setActiveFieldId
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }
  return context
}
