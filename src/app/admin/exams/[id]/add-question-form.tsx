
'use client'

import { useState, ChangeEvent, useRef } from 'react'
import { addQuestion } from './actions'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { EditorProvider } from '@/components/ui/editor-context'
import UnifiedToolbar from '@/components/ui/unified-toolbar'

const DOMAINS = {
  math: [
    "Algebra",
    "Advanced Math",
    "Problem-Solving and Data Analysis",
    "Geometry and Trigonometry"
  ],
  reading_writing: [
    "Craft and Structure",
    "Information and Ideas",
    "Standard English Conventions",
    "Expression of Ideas"
  ]
}

export default function AddQuestionForm({ examId }: { examId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageBase64, setImageBase64] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('reading_writing')
  const [questionType, setQuestionType] = useState<string>('multiple_choice')
  const questionInputRef = useRef<HTMLTextAreaElement>(null)

  // Math Editor State
  const [mathEquation, setMathEquation] = useState('')
  const mathFieldRef = useRef<any>(null)

  const handleMathInsert = (latex: string) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.cmd(latex)
      mathFieldRef.current.focus()
    }
  }

  // Reset form state helper
  const resetForm = () => {
      setIsExpanded(false)
      setImageBase64('')
      setQuestionType('multiple_choice')
      setMathEquation('')
      if (questionInputRef.current) questionInputRef.current.value = ''
  }

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

  return (
    <EditorProvider>
        <AddQuestionContent 
            examId={examId} 
            isExpanded={isExpanded} 
            setIsExpanded={setIsExpanded} 
        />
    </EditorProvider>
  )
}

function AddQuestionContent({ examId, isExpanded, setIsExpanded }: { examId: string, isExpanded: boolean, setIsExpanded: (v: boolean) => void }) {
  const [imageBase64, setImageBase64] = useState<string>('')
  const [imageDescription, setImageDescription] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('reading_writing')
  const [questionType, setQuestionType] = useState<string>('multiple_choice')
  const questionInputRef = useRef<HTMLTextAreaElement>(null)

  // Determine if math is enabled
  const enableMath = selectedSection === 'math'

  // Reset form state helper
  const resetForm = () => {
      setIsExpanded(false)
      setImageBase64('')
      setQuestionType('multiple_choice')
      if (questionInputRef.current) questionInputRef.current.value = ''
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

  const clearImage = () => {
      setImageBase64('')
      // Reset file input if possible, though React state is enough for the preview
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (formData: FormData) => {
    if (imageBase64) {
        formData.set('imageUrl', imageBase64)
    }
    const result = await addQuestion(examId, formData)
    if (result?.error) {
      alert(result.error)
    } else {
      resetForm()
    }
  }

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg border border-gray-200 relative">
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
              <select 
                id="section" 
                name="section" 
                onChange={(e) => setSelectedSection(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
              >
                <option value="reading_writing">Reading & Writing</option>
                <option value="math">Math</option>
              </select>
            </div>

            {selectedSection === 'math' && (
                <div className="sm:col-span-3">
                    <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">Question Type</label>
                    <select 
                        id="questionType" 
                        name="questionType" 
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                    >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="spr">Student-Produced Response</option>
                    </select>
                </div>
            )}
            
            {/* Hidden input for non-math sections which default to MC */}
            {selectedSection !== 'math' && <input type="hidden" name="questionType" value="multiple_choice" />}

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
                <option value="">Select Domain...</option>
                {selectedSection === 'math' && DOMAINS.math.map(d => (
                   <option key={d} value={d}>{d}</option>
                ))}
                {selectedSection === 'reading_writing' && DOMAINS.reading_writing.map(d => (
                   <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
              <div className="mt-1 flex flex-col gap-2">
                  <input
                    type="text"
                    name="imageDescription"
                    placeholder="Image Description (optional)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                  />
                  <div className="flex space-x-4">
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
                            id="imageUpload"
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                  </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Paste a link OR upload an image (it will be embedded directly).</p>
              {imageBase64 && (
                  <div className="mt-2 relative inline-block group">
                      <p className="text-xs text-green-600 font-semibold">Image selected ready for upload.</p>
                      <img src={imageBase64} alt="Preview" className="h-20 w-auto mt-1 border border-gray-200 rounded" />
                      <button 
                          type="button" 
                          onClick={clearImage}
                          className="absolute top-6 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Image"
                      >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
              )}
            </div>

            {/* Passage - Only for Reading & Writing sections */}
            {selectedSection === 'reading_writing' && (
                <div className="sm:col-span-6">
                  <RichTextEditor
                    id="passage"
                    name="passage"
                    label="Passage"
                    rows={3}
                    enableMath={false}
                  />
                </div>
            )}

            <div className="sm:col-span-6">
              <RichTextEditor
                id="questionText"
                name="questionText"
                label="Question Text"
                rows={6}
                required
                enableMath={enableMath}
              />
            </div>

            {/* Options or Direct Answer based on type */}
            {questionType === 'multiple_choice' ? (
                <>
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <RichTextEditor id="optionA" name="optionA" label="Option A" required rows={2} enableMath={enableMath} />
                            </div>
                            <div className="sm:col-span-1">
                                <RichTextEditor id="optionB" name="optionB" label="Option B" required rows={2} enableMath={enableMath} />
                            </div>
                            <div className="sm:col-span-1">
                                <RichTextEditor id="optionC" name="optionC" label="Option C" required rows={2} enableMath={enableMath} />
                            </div>
                            <div className="sm:col-span-1">
                                <RichTextEditor id="optionD" name="optionD" label="Option D" required rows={2} enableMath={enableMath} />
                            </div>
                        </div>
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
                </>
            ) : (
                <div className="sm:col-span-6">
                    <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">Correct Answer(s)</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="correctAnswer"
                            id="correctAnswer"
                            required
                            placeholder="e.g. 3.5, 1/2, or 25"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Enter the exact value students must type. For multiple valid answers, separate them with a vertical bar (|). Example: <strong>3.5|7/2</strong>
                        </p>
                    </div>
                </div>
            )}

            <div className="sm:col-span-6">
              <RichTextEditor
                id="explanation"
                name="explanation"
                label="Explanation (Optional)"
                rows={2}
                enableMath={enableMath}
              />
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
