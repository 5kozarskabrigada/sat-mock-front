
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { deleteExam } from './actions'
import { useState } from 'react'
import ConfirmationModal from '@/components/confirmation-modal'

function DeleteButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete Exam'}
    </button>
  )
}

export default function DeleteExamButton({ examId }: { examId: string }) {
  const deleteAction = deleteExam.bind(null, examId)
  const [state, formAction] = useActionState(deleteAction, null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
        <form action={formAction}>
        <DeleteButton onClick={() => setIsModalOpen(true)} />
        {state?.error && (
            <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
        </form>

        <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
                // We need to trigger the form action. 
                // Since formAction is a hook result, we can't call it directly easily outside form context without a ref or hidden button.
                // Simpler approach: Use a hidden submit button.
                const form = document.getElementById('delete-exam-form') as HTMLFormElement
                if (form) form.requestSubmit()
            }}
            title="Delete Exam"
            message="Are you sure you want to delete this exam? It will be moved to the recycle bin and can be restored later."
            confirmText="Delete"
            isDangerous={true}
        />
        {/* Hidden form for the actual submission triggered by modal */}
        <form id="delete-exam-form" action={formAction} className="hidden" />
    </>
  )
}
