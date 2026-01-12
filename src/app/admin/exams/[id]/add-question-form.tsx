
'use client'

import { useState, ChangeEvent } from 'react'
import { addQuestion } from './actions'

export default function AddQuestionForm({ examId }: { examId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageBase64, setImageBase64] = useState<string>('')
  
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (imageBase64) {
        formData.set('imageUrl', imageBase64)
    }
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
              <div className="mt-1 flex space-x-4">
                  <input 
                    type="url" 
                    id="imageUrl" 
                    name="imageUrl" 
                    placeholder="https://example.com/image.png"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black flex-1" 
                  />
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">OR Upload:</span>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Paste a link OR upload an image (it will be embedded directly).</p>
              {imageBase64 && (
                  <div className="mt-2">
                      <p className="text-xs text-green-600 font-semibold">Image selected ready for upload.</p>
                      <img src={imageBase64} alt="Preview" className="h-20 w-auto mt-1 border border-gray-200 rounded" />
                  </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="passage" className="block text-sm font-medium text-gray-700">Passage (Optional)</label>
              <textarea id="passage" name="passage" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">Question Text (Supports LaTeX e.g. \( x^2 \))</label>
              <textarea id="questionText" name="questionText" rows={6} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
              <p className="mt-1 text-xs text-gray-500">Press Enter to create a new line.</p>
            </div>

            {/* Options */}
            <div className="sm:col-span-3">
              <label htmlFor="optionA" className="block text-sm font-medium text-gray-700">Option A</label>
              <textarea name="optionA" id="optionA" required rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="optionB" className="block text-sm font-medium text-gray-700">Option B</label>
              <textarea name="optionB" id="optionB" required rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="optionC" className="block text-sm font-medium text-gray-700">Option C</label>
              <textarea name="optionC" id="optionC" required rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="optionD" className="block text-sm font-medium text-gray-700">Option D</label>
              <textarea name="optionD" id="optionD" required rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
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
