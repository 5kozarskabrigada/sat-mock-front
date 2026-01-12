
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createClassroom } from './actions'
import { useState, useEffect } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Creating...' : 'Create Classroom'}
    </button>
  )
}

export default function CreateClassroomForm() {
  const [state, formAction] = useFormState(createClassroom, null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setIsExpanded(false)
    }
  }, [state])

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Create New Classroom
      </button>
    )
  }

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 mb-8 overflow-hidden">
      <div className="px-4 py-5 sm:p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Classroom</h3>
        <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-500">
             <span className="sr-only">Close</span>
             <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
               <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
             </svg>
        </button>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Classroom Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                placeholder="e.g. SAT Prep Fall 2024"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <div className="mt-1">
              <textarea
                name="description"
                id="description"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                placeholder="e.g. Advanced Math Group"
              />
            </div>
          </div>
          
          {state?.error && (
             <div className="text-sm text-red-600">{state.error}</div>
          )}

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
