
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { removeStudentFromClassroom } from '../actions'
import { useState } from 'react'
import ConfirmationModal from '@/components/confirmation-modal'

function RemoveButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
    >
      {pending ? 'Removing...' : 'Remove'}
    </button>
  )
}

export default function RemoveStudentButton({ classroomId, studentId }: { classroomId: string, studentId: string }) {
  const removeAction = removeStudentFromClassroom.bind(null, classroomId, studentId)
  const [state, formAction] = useActionState(removeAction, null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
        <form id={`remove-student-${studentId}`} action={formAction}>
            <RemoveButton onClick={() => setIsModalOpen(true)} />
        </form>
        <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
                const form = document.getElementById(`remove-student-${studentId}`) as HTMLFormElement
                if (form) form.requestSubmit()
            }}
            title="Remove Student"
            message="Are you sure you want to remove this student from the classroom?"
            confirmText="Remove"
            isDangerous={true}
        />
    </>
  )
}
