
'use client'

import { useState } from 'react'
import { addQuestion } from './actions'

export default function AddQuestionForm({ examId }: { examId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Add New Question
      </button>
    )
  }

  const handleSubmit = async (formData: FormData) => {
    const result = await addQuestion(examId, formData)
    if (result?.error) {
      alert(result.error)
    } else {
      setIsExpanded(false)
    }
  }

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Add Question</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            Cancel
          </button>
        </div>
        
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
              <select id="section" name="section" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
                <option value="reading_writing">Reading & Writing</option>
                <option value="math">Math</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="module" className="block text-sm font-medium text-gray-700">Module</label>
              <select id="module" name="module" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
                <option value="1">Module 1</option>
                <option value="2">Module 2</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain / Topic</label>
              <select 
                id="domain" 
                name="domain" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
              >
                <optgroup label="Math">
                    <option value="Algebra">Algebra</option>
                    <option value="Advanced Math">Advanced Math</option>
                    <option value="Problem-Solving and Data Analysis">Problem-Solving and Data Analysis</option>
                    <option value="Geometry and Trigonometry">Geometry and Trigonometry</option>
                </optgroup>
                <optgroup label="Reading & Writing">
                    <option value="Craft and Structure">Craft and Structure</option>
                    <option value="Information and Ideas">Information and Ideas</option>
                    <option value="Standard English Conventions">Standard English Conventions</option>
                    <option value="Expression of Ideas">Expression of Ideas</option>
                </optgroup>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
              <input 
                type="url" 
                id="imageUrl" 
                name="imageUrl" 
                placeholder="https://example.com/image.png"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" 
              />
              <p className="mt-1 text-xs text-gray-500">Paste a link to an image to display it in the question.</p>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="passage" className="block text-sm font-medium text-gray-700">Passage (Optional)</label>
              <textarea id="passage" name="passage" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">Question Text (Supports LaTeX e.g. \( x^2 \))</label>
              <textarea id="questionText" name="questionText" rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            {/* Options */}
            <div className="sm:col-span-3">
              <label htmlFor="optionA" className="block text-sm font-medium text-gray-700">Option A</label>
              <input type="text" name="optionA" id="optionA" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="optionB" className="block text-sm font-medium text-gray-700">Option B</label>
              <input type="text" name="optionB" id="optionB" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="optionC" className="block text-sm font-medium text-gray-700">Option C</label>
              <input type="text" name="optionC" id="optionC" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="optionD" className="block text-sm font-medium text-gray-700">Option D</label>
              <input type="text" name="optionD" id="optionD" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">Correct Answer</label>
              <select id="correctAnswer" name="correctAnswer" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">Explanation (Optional)</label>
              <textarea id="explanation" name="explanation" rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
