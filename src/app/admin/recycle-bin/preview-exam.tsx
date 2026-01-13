
'use client'

import { useState } from 'react'

export default function PreviewExam({ exam }: { exam: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-indigo-600 hover:text-indigo-800 ml-2 font-medium"
      >
        {isOpen ? 'Hide Details' : 'Preview Details'}
      </button>
      
      {isOpen && (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Description</p>
                      <p className="text-gray-800">{exam.description || 'No description provided.'}</p>
                  </div>
                  <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Metadata</p>
                      <div className="mt-1 space-y-1">
                          <p><span className="text-gray-500">Code:</span> <span className="font-mono">{exam.code}</span></p>
                          <p><span className="text-gray-500">Type:</span> <span className="capitalize">{exam.type}</span></p>
                          <p><span className="text-gray-500">Created:</span> {new Date(exam.created_at).toLocaleDateString()}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  )
}
