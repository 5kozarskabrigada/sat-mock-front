'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { joinExam } from './actions'

export default function JoinExamForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const code = formData.get('code') as string

    // Request fullscreen as soon as user interacts to join
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    }

    try {
      const result = await joinExam(code)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.success && result.examId) {
        // Navigate to exam
        router.push(`/exam/${result.examId}`)
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center uppercase tracking-widest font-mono font-bold text-lg text-black disabled:opacity-50"
            placeholder="ABC123"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Start Exam'}
        </button>
      </div>
    </form>
  )
}
