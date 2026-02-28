
'use client'

import { useState, ChangeEvent, useRef } from 'react'
import { addQuestion } from './actions'
import { createClient } from '@/utils/supabase/client'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { EditorProvider } from '@/components/ui/editor-context'
import UnifiedToolbar from '@/components/ui/unified-toolbar'
import LatexRenderer from '@/components/ui/latex-renderer'

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
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageDescription, setImageDescription] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('reading_writing')
  const [questionType, setQuestionType] = useState<string>('multiple_choice')
  const questionInputRef = useRef<HTMLTextAreaElement>(null)

  // Determine if math is enabled
  const enableMath = selectedSection === 'math'

  // Reset form state helper
  const resetForm = () => {
      setIsExpanded(false)
      setImageUrl('')
      setImageDescription('')
      setUploadError(null)
      setQuestionType('multiple_choice')
      if (questionInputRef.current) questionInputRef.current.value = ''
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadError(null)
      setUploading(true)

      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const supabase = createClient()

      const { error: uploadErr } = await supabase.storage
        .from('exam-images')
        .upload(filePath, file)

      if (uploadErr) {
        throw uploadErr
      }

      const { data } = supabase.storage
        .from('exam-images')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setUploadError('Error uploading image. Ensure the "exam-images" storage bucket exists and is public.')
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
      setImageUrl('')
      setUploadError(null)
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (formData: FormData) => {
    if (imageUrl) {
        formData.set('imageUrl', imageUrl)
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
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image (Optional)</label>
              <div className="mt-1 flex flex-col gap-2">
                  <RichTextEditor
                    id="imageDescription"
                    name="imageDescription"
                    label="Image Description (Optional)"
                    defaultValue={imageDescription}
                    onChange={setImageDescription}
                    rows={2}
                    enableMath={true}
                  />
                  <div className="flex items-center gap-4">
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                  </div>
                  <div>
                    <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="Or paste image URL directly"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border text-gray-500"
                        value={imageUrl || ''}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
              </div>
              {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
              <p className="mt-1 text-xs text-gray-500">Upload an image or paste a direct URL.</p>
              {imageUrl && (
                  <div className="mt-2 relative inline-block group">
                      <img src={imageUrl} alt="Preview" className="h-32 w-auto object-contain rounded border border-gray-300" />
                      <button 
                          type="button" 
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200"
                          title="Remove Image"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
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
