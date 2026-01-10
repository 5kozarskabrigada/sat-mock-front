
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
      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
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
       // Client-side redirect is safer for replication lag than server-side redirect immediately after write
       router.push(`/admin/exams/${state.examId}`)
    }
  }, [state, router])
  
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100">
      <div className="px-4 py-5 sm:p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Exam</h3>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new mock exam or practice set. You'll be able to add questions after creating it.
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Exam Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  placeholder="e.g. SAT Practice Test #1"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Brief description for students..."
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <div className="mt-1">
                <select
                  id="type"
                  name="type"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-white"
                >
                  <option value="mock">Full Mock Exam</option>
                  <option value="practice">Practice Set</option>
                </select>
              </div>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error creating exam</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{state.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
