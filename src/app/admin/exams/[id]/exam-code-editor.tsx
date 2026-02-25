'use client'

import { useState } from 'react'
import { updateExamCode } from './actions'

export default function ExamCodeEditor({ examId, currentCode }: { examId: string, currentCode: string }) {
  const [code, setCode] = useState(currentCode)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setCode(newCode)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const result = await updateExamCode(examId, code)
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setCode(currentCode)
    setIsEditing(false)
    setError(null)
  }

  if (!isEditing) {
    return (
      <div>
        <dt className="text-sm font-medium text-gray-500 truncate">Exam Code</dt>
        <dd className="mt-2 flex items-center gap-2">
          <span className="text-lg font-mono font-semibold text-gray-900 tracking-tight">{currentCode}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            title="Edit exam code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
        </dd>
      </div>
    )
  }

  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 truncate">Exam Code</dt>
      <dd className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-28 text-sm font-mono font-semibold text-gray-900 tracking-tight border border-gray-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={10}
          />
          <button
            onClick={generateCode}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-medium transition-colors"
            title="Generate random code"
          >
            Generate
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !code.trim()}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </dd>
    </div>
  )
}
