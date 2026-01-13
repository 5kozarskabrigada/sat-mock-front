
'use client'

import { useState } from 'react'

export default function PreviewQuestion({ question }: { question: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-indigo-600 hover:text-indigo-800 ml-2"
      >
        {isOpen ? 'Hide' : 'Preview'}
      </button>
      
      {isOpen && (
          <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                      <p className="font-medium text-gray-700 mb-1">Question:</p>
                      <p className="mb-2 text-gray-800 whitespace-pre-wrap">{question.content.question}</p>
                      
                      {question.content.image_url && (
                          <div className="mb-2">
                              <img src={question.content.image_url} alt="Question Diagram" className="max-h-40 rounded border border-gray-200" />
                          </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className={`p-1 rounded border ${question.correct_answer === 'A' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>A: {question.content.options.A}</div>
                          <div className={`p-1 rounded border ${question.correct_answer === 'B' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>B: {question.content.options.B}</div>
                          <div className={`p-1 rounded border ${question.correct_answer === 'C' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>C: {question.content.options.C}</div>
                          <div className={`p-1 rounded border ${question.correct_answer === 'D' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>D: {question.content.options.D}</div>
                      </div>
                  </div>
                  
                  <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-2 md:pt-0 md:pl-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Metadata</p>
                      <div className="space-y-1 text-xs">
                          <p><span className="text-gray-500">Section:</span> <span className="capitalize">{question.section.replace('_', ' & ')}</span></p>
                          <p><span className="text-gray-500">Module:</span> {question.module}</p>
                          <p><span className="text-gray-500">Domain:</span> {question.domain || 'N/A'}</p>
                          <p><span className="text-gray-500">Deleted:</span> {new Date(question.deleted_at).toLocaleString()}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  )
}
