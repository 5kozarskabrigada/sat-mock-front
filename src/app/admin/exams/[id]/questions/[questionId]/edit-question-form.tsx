
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateQuestion, deleteQuestion } from '../../../actions'

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

function DeleteButton({ questionId, examId }: { questionId: string, examId: string }) {
    return (
        <button
            type="button"
            onClick={async () => {
                if (confirm('Are you sure you want to delete this question? This cannot be undone (but can be restored from DB if needed).')) {
                    await deleteQuestion(questionId, examId)
                }
            }}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-red-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
            Delete Question
        </button>
    )
}

export default function EditQuestionForm({ question, examId }: { question: any, examId: string }) {
  const updateQuestionWithId = updateQuestion.bind(null, question.id, examId)
  const [state, formAction] = useFormState(updateQuestionWithId, null)

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            
            <div className="sm:col-span-3">
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
              <select id="section" name="section" defaultValue={question.section} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
                <option value="reading_writing">Reading & Writing</option>
                <option value="math">Math</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="module" className="block text-sm font-medium text-gray-700">Module</label>
              <select id="module" name="module" defaultValue={question.module} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black">
                <option value="1">Module 1</option>
                <option value="2">Module 2</option>
              </select>
            </div>

            <div className="sm:col-span-6">
               <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain (Optional)</label>
               <input type="text" name="domain" id="domain" defaultValue={question.domain} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" placeholder="e.g. Algebra" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="passage" className="block text-sm font-medium text-gray-700">Passage (Optional)</label>
              <textarea id="passage" name="passage" rows={3} defaultValue={question.content.passage} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
              <input type="text" name="imageUrl" id="imageUrl" defaultValue={question.content.image_url} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">Question Text (Supports LaTeX e.g. \( x^2 \))</label>
              <textarea id="questionText" name="questionText" rows={3} defaultValue={question.content.question} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>

            <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt}>
                            <label htmlFor={`option${opt}`} className="block text-xs font-medium text-gray-500">Option {opt}</label>
                            <textarea 
                                id={`option${opt}`} 
                                name={`option${opt}`} 
                                rows={2} 
                                defaultValue={question.content.options[opt]}
                                required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" 
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

            <div className="sm:col-span-6">
              <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">Explanation (Optional)</label>
              <textarea id="explanation" name="explanation" rows={3} defaultValue={question.explanation} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black" />
            </div>
          </div>
          
          {state?.error && (
             <div className="text-sm text-red-600">{state.error}</div>
          )}

          <div className="flex justify-between">
            <DeleteButton questionId={question.id} examId={examId} />
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
