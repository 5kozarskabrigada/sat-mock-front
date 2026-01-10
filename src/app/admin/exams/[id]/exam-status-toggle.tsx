
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { toggleExamStatus } from './actions'

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

export default function ExamStatusToggle({ examId, status }: { examId: string, status: string }) {
  // Bind the arguments to the action
  const toggleAction = toggleExamStatus.bind(null, examId, status)
  const [state, formAction] = useFormState(toggleAction, null)

  return (
    <form action={formAction} className="inline-block">
      <SubmitButton status={status} />
      {state?.error && (
        <span className="ml-2 text-xs text-red-600">{state.error}</span>
      )}
    </form>
  )
}
