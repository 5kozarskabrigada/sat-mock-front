
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createExam } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Creating...' : 'Create Exam'}
    </button>
  )
}

export default function CreateExamForm() {
  const [state, formAction] = useFormState(createExam, null)

  return (
    <form action={formAction} className="space-y-6 bg-white px-4 py-5 sm:p-6 shadow sm:rounded-md">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-6 sm:col-span-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Exam Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="col-span-6 sm:col-span-3">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="mock">Full Mock Exam</option>
            <option value="practice">Practice Set</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <div className="text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
