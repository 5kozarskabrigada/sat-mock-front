
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { deleteExam } from './actions'
import { useRouter } from 'next/navigation'

function DeleteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete Exam'}
    </button>
  )
}

export default function DeleteExamButton({ examId }: { examId: string }) {
  const deleteAction = deleteExam.bind(null, examId)
  const [state, formAction] = useFormState(deleteAction, null)

  return (
    <form action={formAction} onSubmit={(e) => {
        if (!confirm('Are you sure you want to delete this exam? This will move it to the recycle bin.')) {
            e.preventDefault()
        }
    }}>
      <DeleteButton />
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  )
}
