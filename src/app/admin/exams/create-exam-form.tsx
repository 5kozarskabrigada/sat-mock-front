
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createExam } from './actions'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
    >
      {pending ? 'Creating...' : 'Create Exam'}
    </button>
  )
}

export default function CreateExamForm() {
  const [state, formAction] = useActionState(createExam, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.examId) {
       router.push(`/admin/exams/${state.examId}`)
    }
  }, [state, router])
  
  return (
    <div className="w-full">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2 text-center">Create New Exam</h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Set up a new mock exam or practice set.
        </p>
      
        <form action={formAction} className="space-y-4">
          <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Exam Title</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="e.g. SAT Mock #1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black bg-white"
              />
          </div>

          <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Optional description..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black bg-white"
              />
          </div>

          <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Exam Type</label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-black"
              >
                <option value="mock">Full Mock Exam</option>
                <option value="practice">Practice Set</option>
              </select>
          </div>

          {state?.error && (
            <div className="rounded-md bg-red-50 p-2">
                <div className="text-sm text-red-700">{state.error}</div>
            </div>
          )}

          <div className="pt-2">
             <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
             >
                Create Exam
             </button>
          </div>
        </form>
    </div>
  )
}
