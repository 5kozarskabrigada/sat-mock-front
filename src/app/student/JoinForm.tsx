'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
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

export default function JoinExamForm() {
  const [state, formAction] = useActionState(joinExam, null)

  const handleSubmit = (formData: FormData) => {
    // Request fullscreen as soon as user interacts to join
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    }
    formAction(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
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
  )
}
