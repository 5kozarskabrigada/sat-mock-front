
'use client'

import { useState } from 'react'

export default function QuestionViewer({ 
  question, 
  questionIndex, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerChange,
  isMathSection
}: { 
  question: any
  questionIndex: number
  totalQuestions: number
  selectedAnswer: any
  onAnswerChange: (val: any) => void
  isMathSection?: boolean
}) {
  const isMultipleChoice = question.content.options && question.content.options.A
  const [inputValue, setInputValue] = useState(selectedAnswer || '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onAnswerChange(e.target.value)
  }

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Decorative dashed line top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10 flex">
        {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`flex-1 h-full ${['bg-blue-800', 'bg-green-700', 'bg-red-700', 'bg-yellow-600'][i % 4]} mr-1 rounded-full opacity-80`}></div>
        ))}
      </div>

      {/* Left Pane: Passage / Instructions */}
      <div className="w-1/2 h-full overflow-y-auto border-r border-gray-300 bg-white p-10 pt-12 pb-20">
        {/* Section Header */}
        <div className="mb-6">
           <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <h3 className="font-serif font-bold text-lg mb-1">
                 {isMathSection ? 'Section 2, Module 1: Math' : 'Section 1, Module 1: Reading and Writing'}
              </h3>
              <button className="text-blue-600 underline text-sm font-sans">Directions</button>
           </div>
        </div>

        {/* Content */}
        <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-900">
            {question.content.passage ? (
                <p className="whitespace-pre-wrap">{question.content.passage}</p>
            ) : isMathSection ? (
                <div>
                    <h4 className="font-bold mb-4">Student-Produced Response Directions</h4>
                    <ul className="list-disc pl-5 space-y-2 text-base">
                        <li>If you find more than one correct answer, enter only one answer.</li>
                        <li>You can enter up to 5 characters for a positive answer and up to 6 characters for a negative answer.</li>
                        <li>Don’t enter symbols such as a percent sign, comma, or dollar sign.</li>
                    </ul>
                    {/* Simplified Examples Table */}
                    <table className="mt-6 w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Answer</th>
                                <th className="border p-2">Acceptable</th>
                                <th className="border p-2">Unacceptable</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border p-2">3.5</td>
                                <td className="border p-2">3.5, 3.50, 7/2</td>
                                <td className="border p-2">3 1/2, 31/2</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 italic">[No passage provided for this question]</p>
            )}
        </div>
      </div>

      {/* Right Pane: Question */}
      <div className="w-1/2 h-full overflow-y-auto bg-gray-50 p-10 pt-12 pb-20">
        {/* Question Header Bar */}
        <div className="bg-[#eef0f2] border-b border-gray-300 flex items-center justify-between px-4 py-3 mb-6 rounded-t-md">
            <div className="flex items-center space-x-3">
                <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-sm shadow-sm">
                    {questionIndex + 1}
                </div>
                <div className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                    </svg>
                    <span className="font-sans font-medium text-sm">Mark for Review</span>
                </div>
            </div>
            <div className="text-gray-400">
                <span className="border border-gray-300 rounded px-1 text-xs">ABC</span>
            </div>
        </div>

        {/* Question Text */}
        <div className="mb-8 font-serif text-xl leading-relaxed text-gray-900">
            {question.content.question}
        </div>

        {/* Answer Area */}
        <div className="space-y-4">
            {isMultipleChoice ? (
                Object.entries(question.content.options).map(([key, value]) => {
                    if (!value) return null
                    const isSelected = selectedAnswer === key
                    return (
                        <button
                            key={key}
                            onClick={() => onAnswerChange(key)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group
                                ${isSelected 
                                    ? 'border-indigo-600 bg-white shadow-md' 
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-sans font-bold text-sm flex-shrink-0
                                ${isSelected ? 'bg-black text-white border-black' : 'border-black text-black'}
                            `}>
                                {key}
                            </div>
                            <span className="font-serif text-lg text-gray-800 group-hover:text-black">
                                {value as string}
                            </span>
                            
                            {/* Annotation Dot Mock */}
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center border border-pink-200">
                                    <span className="text-xs font-bold">st</span>
                                </div>
                            </div>
                        </button>
                    )
                })
            ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Enter your answer (e.g., 5.566, -5.566, 2/3, -2/3)
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-full p-4 border-2 border-gray-300 rounded-lg font-serif text-xl focus:border-indigo-600 focus:ring-0 outline-none"
                        placeholder="Answer"
                    />
                </div>
            )}
        </div>
      </div>
      
       {/* Decorative dashed line bottom */}
       <div className="absolute bottom-0 left-0 right-0 h-1 z-10 flex">
        {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`flex-1 h-full ${['bg-blue-800', 'bg-green-700', 'bg-red-700', 'bg-yellow-600'][i % 4]} mr-1 rounded-full opacity-80`}></div>
        ))}
      </div>
    </div>
  )
}
