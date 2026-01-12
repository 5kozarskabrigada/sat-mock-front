
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { restoreExam, restoreQuestion, permanentlyDeleteExam, permanentlyDeleteQuestion } from './actions'

function ActionButton({ label, loadingLabel, color = 'indigo' }: { label: string, loadingLabel: string, color?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`text-sm font-medium text-${color}-600 hover:text-${color}-900 disabled:opacity-50`}
    >
      {pending ? loadingLabel : label}
    </button>
  )
}

export function RestoreExamButton({ examId }: { examId: string }) {
  const restore = restoreExam.bind(null, examId)
  const [state, formAction] = useFormState(restore, null)
  return <form action={formAction}><ActionButton label="Restore" loadingLabel="Restoring..." /></form>
}

export function RestoreQuestionButton({ questionId }: { questionId: string }) {
  const restore = restoreQuestion.bind(null, questionId)
  const [state, formAction] = useFormState(restore, null)
  return <form action={formAction}><ActionButton label="Restore" loadingLabel="Restoring..." /></form>
}

export function PermanentDeleteExamButton({ examId }: { examId: string }) {
  const del = permanentlyDeleteExam.bind(null, examId)
  const [state, formAction] = useFormState(del, null)
  return (
    <form action={formAction} onSubmit={(e) => { if(!confirm('Permanently delete?')) e.preventDefault() }}>
        <ActionButton label="Delete Forever" loadingLabel="Deleting..." color="red" />
    </form>
  )
}

export function PermanentDeleteQuestionButton({ questionId }: { questionId: string }) {
  const del = permanentlyDeleteQuestion.bind(null, questionId)
  const [state, formAction] = useFormState(del, null)
  return (
    <form action={formAction} onSubmit={(e) => { if(!confirm('Permanently delete?')) e.preventDefault() }}>
        <ActionButton label="Delete Forever" loadingLabel="Deleting..." color="red" />
    </form>
  )
}
