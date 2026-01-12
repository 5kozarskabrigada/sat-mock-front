
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { joinExam } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Joining...' : 'Start Exam'}
    </button>
  )
}

export default function StudentDashboard() {
  const [state, formAction] = useFormState(joinExam, null)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the exam code provided by your instructor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Exam Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center uppercase tracking-widest font-mono font-bold text-lg text-black"
                  placeholder="ABC123"
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-sm text-red-600 text-center">
                {state.error}
              </div>
            )}

            <div>
              <SubmitButton />
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
             <form action="/auth/signout" method="post">
                 <button className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
             </form>
        </div>
      </div>
    </div>
  )
}
