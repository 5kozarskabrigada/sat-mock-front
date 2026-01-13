
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
              <p className="font-medium text-gray-700 mb-1">Question:</p>
              <p className="mb-2 text-gray-800 whitespace-pre-wrap">{question.content.question}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-1 rounded border ${question.correct_answer === 'A' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>A: {question.content.options.A}</div>
                  <div className={`p-1 rounded border ${question.correct_answer === 'B' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>B: {question.content.options.B}</div>
                  <div className={`p-1 rounded border ${question.correct_answer === 'C' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>C: {question.content.options.C}</div>
                  <div className={`p-1 rounded border ${question.correct_answer === 'D' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>D: {question.content.options.D}</div>
              </div>
          </div>
      )}
    </>
  )
}
