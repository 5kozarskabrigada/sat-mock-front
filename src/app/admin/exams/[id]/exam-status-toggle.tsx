
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { toggleExamStatus } from './actions'

function SubmitButton({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="text-sm text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-50"
    >
      {pending ? 'Updating...' : (isActive ? 'Deactivate' : 'Activate')}
    </button>
  )
}

export default function ExamStatusToggle({ examId, isActive }: { examId: string, isActive: boolean }) {
  // Bind the arguments to the action
  const toggleAction = toggleExamStatus.bind(null, examId, isActive)
  const [state, formAction] = useFormState(toggleAction, null)

  return (
    <form action={formAction}>
      <SubmitButton isActive={isActive} />
      {state?.error && (
        <span className="ml-2 text-xs text-red-600">{state.error}</span>
      )}
    </form>
  )
}
