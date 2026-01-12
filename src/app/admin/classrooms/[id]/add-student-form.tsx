
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { addStudentToClassroom } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? 'Adding...' : 'Add Student'}
    </button>
  )
}

export default function AddStudentToClassroomForm({ classroomId }: { classroomId: string }) {
  const addStudentWithId = addStudentToClassroom.bind(null, classroomId)
  const [state, formAction] = useFormState(addStudentWithId, null)

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Student to Classroom</h3>
        <form action={formAction} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Student Username
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="username"
                id="username"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
                placeholder="Enter exact username"
              />
            </div>
          </div>
          <SubmitButton />
        </form>
        {state?.error && (
             <div className="mt-2 text-sm text-red-600">{state.error}</div>
        )}
        {state?.success && (
             <div className="mt-2 text-sm text-green-600">Student added successfully!</div>
        )}
      </div>
    </div>
  )
}
