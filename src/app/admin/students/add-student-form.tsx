
'use client'

import { useState, useEffect, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createStudent } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
    >
      {pending ? 'Adding...' : 'Add Student'}
    </button>
  )
}

export default function AddStudentForm() {
  const [state, formAction] = useActionState(createStudent, null)
  const [lastCreated, setLastCreated] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Use useEffect to handle side effects of state changes
  useEffect(() => {
    if (state?.success && state.credentials) {
      // Only update if it's a new student
      if (!lastCreated || lastCreated.username !== state.credentials.username) {
        setLastCreated(state.credentials)
        setCopied(false)
      }
    }
  }, [state, lastCreated])

  const handleCopy = async () => {
    if (!lastCreated) return
    
    const text = `Student Account Details:
Name: ${lastCreated.firstName} ${lastCreated.lastName}
Username: ${lastCreated.username}
Password: ${lastCreated.password}`

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
      // We could add individual field feedback if needed
    } catch (err) {
      console.error('Failed to copy field: ', err)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Student</h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter details below. System generates credentials automatically.
        </p>
      </div>
      
      <div>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
                type="text"
                name="firstName"
                id="firstName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black bg-white"
                placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
                type="text"
                name="lastName"
                id="lastName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black bg-white"
                placeholder="Doe"
            />
          </div>
          
          <div className="pt-2">
             <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
             >
                Add Student
             </button>
          </div>
        </form>
        
        {state?.error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {lastCreated && (
          <div className="mt-6 rounded-md bg-green-50 p-4 border border-green-100">
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-sm font-medium text-green-800">Success!</h3>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white transition-all duration-200 ${
                            copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {copied ? (
                            <>
                                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy All
                            </>
                        )}
                    </button>
                </div>
                <div className="text-sm text-green-700">
                  <div className="bg-white p-3 rounded border border-green-200 shadow-sm">
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{lastCreated.firstName} {lastCreated.lastName}</span>
                      </li>
                      <li className="flex justify-between items-center group">
                        <span className="text-gray-600">Username:</span>
                        <div className="flex items-center">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-2">{lastCreated.username}</span>
                            <button 
                                onClick={() => copyField(lastCreated.username)}
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Copy username"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                      </li>
                      <li className="flex justify-between items-center group">
                        <span className="text-gray-600">Password:</span>
                        <div className="flex items-center">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-2">{lastCreated.password}</span>
                            <button 
                                onClick={() => copyField(lastCreated.password)}
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Copy password"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                      </li>
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
