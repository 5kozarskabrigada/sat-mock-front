
'use client'

import { useFormState, useFormStatus } from 'react-dom'
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
  const [state, formAction] = useFormState(createExam, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.examId) {
       router.push(`/admin/exams/${state.examId}`)
    }
  }, [state, router])
  
  return (
    <div className="h-full flex flex-col justify-center items-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Exam</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Set up a new mock exam or practice set to get started.
        </p>
      
        <form action={formAction} className="w-full max-w-xs space-y-4">
          <div>
              <label htmlFor="title" className="sr-only">Exam Title</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="Exam Title (e.g. Mock #1)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
              />
          </div>

          <div>
              <label htmlFor="description" className="sr-only">Description</label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Description (optional)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
          </div>

          <div>
              <label htmlFor="type" className="sr-only">Type</label>
              <select
                id="type"
                name="type"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-black"
              >
                <option value="mock">Full Mock Exam</option>
                <option value="practice">Practice Set</option>
              </select>
          </div>

          {state?.error && (
            <div className="text-xs text-red-600">
              {state.error}
            </div>
          )}

          <div className="pt-2">
              <div className="flex justify-center">
                <SubmitButton />
              </div>
          </div>
        </form>
    </div>
  )
}
