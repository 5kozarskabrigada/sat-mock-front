
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

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Classroom</h3>
        <p className="mt-1 text-sm text-gray-500">
          Organize students into groups for easier management.
        </p>
      </div>
      
      <div>
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black bg-white"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black bg-white"
                placeholder="e.g. Advanced Math Group"
              />
            </div>
          </div>
          
          {state?.error && (
             <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">{state.error}</div>
          )}

          <div className="pt-2">
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                Create Classroom
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
