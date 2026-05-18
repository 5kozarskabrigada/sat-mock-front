
'use client'

import { useState } from 'react'
import { createStudent } from './actions'

interface AddStudentFormProps {
  onSuccess?: () => void;
}

export default function AddStudentForm({ onSuccess }: AddStudentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCreated, setLastCreated] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string

    const result = await createStudent(firstName, lastName, email, sendEmail)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success && result.credentials) {
      setLastCreated(result.credentials)
      setCopied(false)
      setLoading(false)
      e.currentTarget.reset()
      if (onSuccess) onSuccess()
    }
  }

  const handleCopy = async () => {
    if (!lastCreated) return
    const text = `Username: ${lastCreated.username}\nPassword: ${lastCreated.password}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const copyField = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy field: ', err)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Jane"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="student@example.com"
            />
          </div>

          {/* Send Email Checkbox */}
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <input
              id="sendEmail"
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="sendEmail" className="text-sm text-gray-700 cursor-pointer">
              📧 Send credentials via email
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Student
              </>
            )}
          </button>
        </form>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Success Card */}
      {lastCreated && (
        <div className="mt-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Student Created!</h3>
                <p className="text-xs text-gray-600">{lastCreated.firstName} {lastCreated.lastName}</p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy All'}
            </button>
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Username</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{lastCreated.username}</p>
                </div>
                <button
                  onClick={() => copyField(lastCreated.username)}
                  className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Password</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{lastCreated.password}</p>
                </div>
                <button
                  onClick={() => copyField(lastCreated.password)}
                  className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Email Status */}
          {lastCreated.emailSent && (
            <div className="mt-3 flex items-center p-2 bg-blue-50 rounded-md border border-blue-200">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="ml-2 text-xs text-blue-700">Email sent to {lastCreated.email}</span>
            </div>
          )}

          {/* Warning */}
          <div className="mt-3 p-2 bg-amber-50 rounded-md border border-amber-200">
            <p className="text-xs text-amber-700">
              ⚠️ Save these credentials - they won't be displayed again
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
