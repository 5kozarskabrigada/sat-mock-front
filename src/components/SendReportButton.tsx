'use client'

import { useState } from 'react'
import { studentExamsAPI } from '@/lib/api-client'

interface SendReportButtonProps {
  attemptId: string
  studentEmail: string
  studentName: string
  compact?: boolean
}

export default function SendReportButton({ attemptId, studentEmail, studentName, compact = false }: SendReportButtonProps) {
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [customEmail, setCustomEmail] = useState('')

  const handleSend = async (email?: string) => {
    if (!email && (!studentEmail || studentEmail.includes('@sat-platform.local'))) {
      setShowEmailInput(true)
      return
    }

    setSending(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/student-exams/${attemptId}/send-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: email || studentEmail })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send report')
      }

      setSuccess(true)
      setShowEmailInput(false)
      setCustomEmail('')
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error('Error sending report:', err)
      setError(err.message || 'Failed to send report')
    } finally {
      setSending(false)
    }
  }

  if (showEmailInput) {
    return (
      <div className="flex flex-col gap-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <label className="text-sm font-medium text-gray-700">Enter student email:</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="student@example.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#123b71] focus:border-[#123b71]"
          />
          <button
            onClick={() => handleSend(customEmail)}
            disabled={!customEmail || sending}
            className="px-4 py-2 bg-[#123b71] text-white rounded-md hover:bg-[#0d2a4d] disabled:opacity-50 text-sm font-medium"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
          <button
            onClick={() => {
              setShowEmailInput(false)
              setCustomEmail('')
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <button
        onClick={() => handleSend()}
        disabled={sending || success}
        title={success ? 'Report sent!' : 'Send PDF report via email'}
        className={`inline-flex items-center px-2 py-1 rounded-md transition-colors text-sm font-medium ${
          success 
            ? 'bg-green-50 text-green-700 cursor-default' 
            : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {sending ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : success ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
        {!compact && (
          <span className="ml-1">{sending ? 'Sending...' : success ? 'Sent!' : 'Email'}</span>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => handleSend()}
        disabled={sending}
        className="inline-flex items-center px-4 py-2 bg-[#123b71] text-white rounded-lg hover:bg-[#0d2a4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
      >
        {sending ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send PDF Report
          </>
        )}
      </button>
      
      {success && (
        <span className="inline-flex items-center text-sm text-green-600 font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Sent to {studentEmail}
        </span>
      )}
      
      {error && (
        <span className="inline-flex items-center text-sm text-red-600 font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}
