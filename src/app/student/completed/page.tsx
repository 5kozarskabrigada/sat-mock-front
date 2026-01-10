
import Link from 'next/link'

export default function CompletedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Exam Submitted</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your answers have been securely recorded.
          </p>
        </div>
        <div className="mt-5">
            <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                            You may now close this window or return to the dashboard.
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
