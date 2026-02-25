
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateQuestion, deleteQuestion } from '../../actions'
import ConfirmationModal from '@/components/confirmation-modal'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { useRef } from 'react'
import { EditorProvider } from '@/components/ui/editor-context'
import UnifiedToolbar from '@/components/ui/unified-toolbar'

// Helper component for file upload
function ImageUploader({ defaultUrl, defaultDescription }: { defaultUrl: string, defaultDescription?: string }) {
    const [uploading, setUploading] = useState(false)
    const [imageUrl, setImageUrl] = useState(defaultUrl)
    const [imageDescription, setImageDescription] = useState(defaultDescription || '')
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null)
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const supabase = createClient()
            
            // Upload to Supabase Storage (assuming bucket 'exam-images' exists and is public)
            const { error: uploadError } = await supabase.storage
                .from('exam-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('exam-images')
                .getPublicUrl(filePath)

            setImageUrl(data.publicUrl)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError('Error uploading image. Ensure "exam-images" bucket exists and is public.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image</label>
            
            {/* Hidden inputs to store the actual URL and Description submitted */}
            <input type="hidden" name="imageUrl" value={imageUrl || ''} />
            <input type="hidden" name="imageDescription" value={imageDescription} />

            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Image Description (optional)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                />
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
            </div>
            
            {error && <p className="text-xs text-red-600">{error}</p>}

            {imageUrl && (
                <div className="mt-2 relative group w-fit">
                    <img src={imageUrl} alt="Question Image" className="h-32 w-auto object-contain rounded border border-gray-300" />
                    <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200"
                        title="Remove image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            )}
            
            {/* Fallback URL input if they want to paste external URL */}
            <div className="mt-1">
                <input 
                    type="text" 
                    placeholder="Or paste image URL directly" 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border text-gray-500"
                    value={imageUrl || ''}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </div>
        </div>
    )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-red-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
            Delete Question
        </button>
    )
}

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

export default function EditQuestionForm({ question, examId }: { question: any, examId: string }) {
  return (
    <EditorProvider>
        <EditQuestionContent question={question} examId={examId} />
    </EditorProvider>
  )
}

function EditQuestionContent({ question, examId }: { question: any, examId: string }) {
  const updateQuestionWithId = updateQuestion.bind(null, question.id, examId)
  const [state, formAction] = useActionState(updateQuestionWithId, null)
  const [selectedSection, setSelectedSection] = useState<string>(question.section)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [questionType, setQuestionType] = useState<string>(
      question.content.options && question.content.options.A ? 'multiple_choice' : 'spr'
  )

  // Determine if math is enabled
  const enableMath = selectedSection === 'math'

  const handleDelete = async () => {
    await deleteQuestion(question.id, examId)
  }

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 relative">
      <div className="px-4 py-5 sm:p-6">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            <div className="sm:col-span-3">
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
              <select 
                id="section" 
                name="section" 
                defaultValue={question.section} 
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
            {selectedSection === 'math' && <input type="hidden" name="questionType" value={questionType} />}

            <div className="sm:col-span-3">
              <label htmlFor="module" className="block text-sm font-medium text-gray-700">Module</label>
              <select id="module" name="module" defaultValue={question.module} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
                <option value="1">Module 1</option>
                <option value="2">Module 2</option>
              </select>
            </div>

            <div className="sm:col-span-6">
               <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain</label>
               <select 
                 id="domain" 
                 name="domain" 
                 defaultValue={question.domain} 
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

            {/* Passage - Only for Reading & Writing sections */}
            {selectedSection === 'reading_writing' && (
                <div className="sm:col-span-6">
                  <RichTextEditor
                    id="passage"
                    name="passage"
                    label="Passage"
                    defaultValue={question.content.passage}
                    rows={3}
                    enableMath={false}
                  />
                </div>
            )}

            <div className="sm:col-span-6">
              <ImageUploader 
                defaultUrl={question.content.image_url} 
                defaultDescription={question.content.image_description} 
              />
            </div>

            <div className="sm:col-span-6">
              <RichTextEditor
                id="questionText"
                name="questionText"
                label="Question Text"
                defaultValue={question.content.question}
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
                            {['A', 'B', 'C', 'D'].map((opt) => (
                                <div key={opt}>
                                    <RichTextEditor 
                                        id={`option${opt}`} 
                                        name={`option${opt}`} 
                                        label={`Option ${opt}`}
                                        rows={2} 
                                        defaultValue={question.content.options ? question.content.options[opt] : ''}
                                        required 
                                        enableMath={enableMath}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">Correct Answer</label>
                      <select id="correctAnswer" name="correctAnswer" defaultValue={question.correct_answer} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
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
                            defaultValue={question.correct_answer}
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
                defaultValue={question.explanation}
                rows={3}
                enableMath={enableMath}
              />
            </div>
          </div>
          
          {state?.error && (
             <div className="text-sm text-red-600">{state.error}</div>
          )}

          <div className="flex justify-between">
            <DeleteButton onClick={() => setIsDeleteModalOpen(true)} />
            <SubmitButton />
          </div>
        </form>

        <ConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Question"
          message="Are you sure you want to delete this question? It will be moved to the recycle bin and can be restored later."
          confirmText="Delete"
          isDangerous={true}
        />
      </div>
    </div>
  )
}
