
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CompletedPage() {
  const searchParams = useSearchParams()
  const isDisqualified = searchParams.get('disqualified') === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className={`mt-6 text-3xl font-extrabold ${isDisqualified ? 'text-red-600' : 'text-gray-900'}`}>
            {isDisqualified ? 'Exam Terminated' : 'Exam Submitted'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isDisqualified 
              ? 'Your exam session was terminated due to a security violation.' 
              : 'Your answers have been securely recorded.'
            }
          </p>
        </div>
        <div className="mt-5">
            <div className={`rounded-md p-4 ${isDisqualified ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        {isDisqualified ? (
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                    </div>
                    <div className="ml-3">
                        <p className={`text-sm font-medium ${isDisqualified ? 'text-red-800' : 'text-green-800'}`}>
                            {isDisqualified 
                              ? 'This incident has been reported to the instructor. You are no longer able to access this exam.' 
                              : 'You may now close this window or return to the dashboard.'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <Link href="/student" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to Dashboard
            </Link>
        </div>
      </div>
    </div>
  )
}
