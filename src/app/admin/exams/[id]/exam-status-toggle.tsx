
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { toggleExamStatus } from './actions'
import { useState, useEffect } from 'react'
import ActivationErrorModal from '@/components/activation-error-modal'

function SubmitButton({ status }: { status: string }) {
  const { pending } = useFormStatus()
  
  // Logic: if active, button says "End Exam" or "Deactivate"
  // If draft or ended, button says "Activate"
  const isLive = status === 'active'
  const label = isLive ? 'End Exam' : 'Activate'

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`text-sm font-medium px-3 py-1 rounded-md text-white ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
    >
      {pending ? 'Updating...' : label}
    </button>
  )
}

export default function ExamStatusToggle({ examId, status, classrooms }: { examId: string, status: string, classrooms: any[] }) {
  const [selectedClassroom, setSelectedClassroom] = useState<string>('')

  // Bind the arguments to the action
  const toggleAction = toggleExamStatus.bind(null, examId, status, selectedClassroom || null)
  const [state, formAction] = useFormState(toggleAction, null)
  const [showValidationModal, setShowValidationModal] = useState(false)

  useEffect(() => {
    if (state?.validationError) {
      setShowValidationModal(true)
    }
  }, [state])

  const isLive = status === 'active'

  return (
    <>
    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        {!isLive && (
            <div className="flex flex-col items-end">
                <label className="text-xs text-gray-500 mb-1">Assign to:</label>
                <select 
                    className="text-sm border-gray-300 rounded-md shadow-sm p-1.5 text-black min-w-[150px] bg-white focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                >
                    <option value="">All Students (Public)</option>
                    {classrooms.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
        )}
        <form action={formAction} className="inline-block">
        <SubmitButton status={status} />
        {state?.error && (
            <p className="mt-1 text-xs text-red-600">{state.error}</p>
        )}
        </form>
    </div>

    <ActivationErrorModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validation={state?.validationError || null}
        examId={examId}
        context="details"
    />
    </>
  )
}
