
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { toggleExamStatus, updateLockdownPolicy } from './actions'
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
      className={`text-sm font-medium px-4 py-2 rounded-lg text-white shadow-sm transition-all ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
    >
      {pending ? 'Updating...' : label}
    </button>
  )
}

export default function ExamStatusToggle({ 
  examId, 
  status, 
  classrooms,
  lockdownPolicy = 'log',
  currentClassroomId = ''
}: { 
  examId: string, 
  status: string, 
  classrooms: any[],
  lockdownPolicy?: string,
  currentClassroomId?: string
}) {
  const [selectedClassroom, setSelectedClassroom] = useState<string>(currentClassroomId)
  const [policy, setPolicy] = useState(lockdownPolicy)

  // Sync state with props in case of external updates or revalidation
  useEffect(() => {
    setPolicy(lockdownPolicy)
  }, [lockdownPolicy])

  useEffect(() => {
    setSelectedClassroom(currentClassroomId)
  }, [currentClassroomId])

  // Bind the arguments to the action
  const toggleAction = toggleExamStatus.bind(null, examId, status, selectedClassroom || null)
  const [state, formAction] = useActionState(toggleAction, null)
  const [showValidationModal, setShowValidationModal] = useState(false)

  useEffect(() => {
    if (state?.validationError) {
      setShowValidationModal(true)
    }
  }, [state])

  const handlePolicyChange = async (newPolicy: string) => {
    // Optimistic update
    const previousPolicy = policy
    setPolicy(newPolicy)
    
    try {
        const result = await updateLockdownPolicy(examId, newPolicy as 'log' | 'disqualify')
        if (result?.error) {
            console.error("Policy update failed:", result.error)
            alert("Failed to update policy: " + result.error)
            setPolicy(previousPolicy) // Revert
        }
    } catch (e) {
        console.error("Policy update exception:", e)
        setPolicy(previousPolicy)
    }
  }

  const isLive = status === 'active'

  return (
    <>
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-inner">
        {!isLive && (
            <div className="flex flex-col items-start">
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">Assign Classroom</label>
                <select 
                    className="text-sm border-gray-300 rounded-lg shadow-sm p-2 text-black min-w-[180px] bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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

        <div className="flex flex-col items-start">
            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-wider">Security Policy</label>
            <select 
                className="text-sm border-gray-300 rounded-lg shadow-sm p-2 text-black min-w-[180px] bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={policy}
                onChange={(e) => handlePolicyChange(e.target.value)}
            >
                <option value="log">Log Violations (Standard)</option>
                <option value="disqualify">Immediate Disqualify (Strict)</option>
            </select>
        </div>

        <div className="flex flex-col items-end pt-5">
            <form action={formAction} className="inline-block">
                <SubmitButton status={status} />
                {state?.error && (
                    <p className="mt-1 text-xs text-red-600">{state.error}</p>
                )}
            </form>
        </div>
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
