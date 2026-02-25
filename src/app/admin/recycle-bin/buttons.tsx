
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { restoreExam, restoreQuestion, permanentlyDeleteExam, permanentlyDeleteQuestion } from './actions'
import { useState } from 'react'
import ConfirmationModal from '@/components/confirmation-modal'

function ActionButton({ label, loadingLabel, color = 'indigo', onClick }: { label: string, loadingLabel: string, color?: string, onClick?: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={pending}
      className={`text-sm font-medium text-${color}-600 hover:text-${color}-900 disabled:opacity-50`}
    >
      {pending ? loadingLabel : label}
    </button>
  )
}

export function RestoreExamButton({ examId }: { examId: string }) {
  const restore = restoreExam.bind(null, examId)
  const [state, formAction] = useActionState(restore, null)
  return <form action={formAction}><ActionButton label="Restore" loadingLabel="Restoring..." /></form>
}

export function RestoreQuestionButton({ questionId }: { questionId: string }) {
  const restore = restoreQuestion.bind(null, questionId)
  const [state, formAction] = useActionState(restore, null)
  return <form action={formAction}><ActionButton label="Restore" loadingLabel="Restoring..." /></form>
}

export function PermanentDeleteExamButton({ examId }: { examId: string }) {
  const del = permanentlyDeleteExam.bind(null, examId)
  const [state, formAction] = useActionState(del, null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
        <form id={`perm-delete-exam-${examId}`} action={formAction}>
            <ActionButton 
                label="Delete Forever" 
                loadingLabel="Deleting..." 
                color="red" 
                onClick={() => setIsModalOpen(true)}
            />
        </form>
        <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
                const form = document.getElementById(`perm-delete-exam-${examId}`) as HTMLFormElement
                if (form) form.requestSubmit()
            }}
            title="Permanently Delete Exam"
            message="Are you sure you want to permanently delete this exam? This action CANNOT be undone."
            confirmText="Delete Forever"
            isDangerous={true}
        />
    </>
  )
}

export function PermanentDeleteQuestionButton({ questionId }: { questionId: string }) {
  const del = permanentlyDeleteQuestion.bind(null, questionId)
  const [state, formAction] = useActionState(del, null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
        <form id={`perm-delete-q-${questionId}`} action={formAction}>
            <ActionButton 
                label="Delete Forever" 
                loadingLabel="Deleting..." 
                color="red" 
                onClick={() => setIsModalOpen(true)}
            />
        </form>
        <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
                const form = document.getElementById(`perm-delete-q-${questionId}`) as HTMLFormElement
                if (form) form.requestSubmit()
            }}
            title="Permanently Delete Question"
            message="Are you sure you want to permanently delete this question? This action CANNOT be undone."
            confirmText="Delete Forever"
            isDangerous={true}
        />
    </>
  )
}
