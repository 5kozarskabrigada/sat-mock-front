
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { deleteClassroom } from './actions'
import { useState } from 'react'
import ConfirmationModal from '@/components/confirmation-modal'

function DeleteButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  )
}

export default function DeleteClassroomButton({ classroomId }: { classroomId: string }) {
  const deleteAction = deleteClassroom.bind(null, classroomId)
  const [state, formAction] = useFormState(deleteAction, null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
        <form id={`delete-classroom-${classroomId}`} action={formAction}>
            <DeleteButton onClick={() => setIsModalOpen(true)} />
        </form>
        <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
                const form = document.getElementById(`delete-classroom-${classroomId}`) as HTMLFormElement
                if (form) form.requestSubmit()
            }}
            title="Delete Classroom"
            message="Are you sure you want to delete this classroom? This action cannot be undone."
            confirmText="Delete"
            isDangerous={true}
        />
    </>
  )
}
