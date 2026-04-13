'use client'

import { useState } from 'react'
import { restoreExam, restoreQuestion, permanentlyDeleteExam, permanentlyDeleteQuestion } from './actions'
import ConfirmationModal from '@/components/confirmation-modal'

function ActionButton({ label, loadingLabel, color = 'indigo', onClick, loading }: { label: string, loadingLabel: string, color?: string, onClick?: () => void, loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        color === 'red'
          ? 'text-sm font-medium text-red-600 hover:text-red-900 disabled:opacity-50'
          : 'text-sm font-medium text-indigo-600 hover:text-indigo-900 disabled:opacity-50'
      }
    >
      {loading ? loadingLabel : label}
    </button>
  )
}

export function RestoreExamButton({ examId, onChanged }: { examId: string, onChanged?: () => void }) {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    const result = await restoreExam(examId)
    setLoading(false)
    if (!result.error) onChanged?.()
  }

  return <ActionButton label="Restore" loadingLabel="Restoring..." onClick={handle} loading={loading} />
}

export function RestoreQuestionButton({ questionId, onChanged }: { questionId: string, onChanged?: () => void }) {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    const result = await restoreQuestion(questionId)
    setLoading(false)
    if (!result.error) onChanged?.()
  }

  return <ActionButton label="Restore" loadingLabel="Restoring..." onClick={handle} loading={loading} />
}

export function PermanentDeleteExamButton({ examId, onChanged }: { examId: string, onChanged?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handle = async () => {
    setLoading(true)
    const result = await permanentlyDeleteExam(examId)
    setLoading(false)
    setIsModalOpen(false)
    if (!result.error) onChanged?.()
  }

  return (
    <>
      <ActionButton label="Delete Forever" loadingLabel="Deleting..." color="red" onClick={() => setIsModalOpen(true)} loading={loading} />
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handle}
        title="Permanently Delete Exam"
        message="Are you sure you want to permanently delete this exam? This action CANNOT be undone."
        confirmText="Delete Forever"
        isDangerous={true}
      />
    </>
  )
}

export function PermanentDeleteQuestionButton({ questionId, onChanged }: { questionId: string, onChanged?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handle = async () => {
    setLoading(true)
    const result = await permanentlyDeleteQuestion(questionId)
    setLoading(false)
    setIsModalOpen(false)
    if (!result.error) onChanged?.()
  }

  return (
    <>
      <ActionButton label="Delete Forever" loadingLabel="Deleting..." color="red" onClick={() => setIsModalOpen(true)} loading={loading} />
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handle}
        title="Permanently Delete Question"
        message="Are you sure you want to permanently delete this question? This action CANNOT be undone."
        confirmText="Delete Forever"
        isDangerous={true}
      />
    </>
  )
}
