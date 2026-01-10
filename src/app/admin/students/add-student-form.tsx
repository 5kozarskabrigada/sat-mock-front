
'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createStudent } from './actions'

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

export default function AddStudentForm() {
  const [state, formAction] = useFormState(createStudent, null)
  const [lastCreated, setLastCreated] = useState<any>(null)

  if (state?.success && state.credentials && (!lastCreated || lastCreated.username !== state.credentials.username)) {
    setLastCreated(state.credentials)
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Student</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Enter the student's name. The system will generate a username and password.</p>
        </div>
        <form action={formAction} className="mt-5 sm:flex sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
          </div>
          <div className="w-full sm:max-w-xs sm:ml-4 mt-4 sm:mt-0">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
            <SubmitButton />
          </div>
        </form>
        
        {state?.error && (
          <div className="mt-4 text-sm text-red-600">
            {state.error}
          </div>
        )}

        {lastCreated && (
          <div className="mt-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Student Added Successfully</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Please copy these credentials immediately:</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Name: {lastCreated.firstName} {lastCreated.lastName}</li>
                    <li>Username: <span className="font-mono font-bold">{lastCreated.username}</span></li>
                    <li>Password: <span className="font-mono font-bold">{lastCreated.password}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
