'use client'

import { useState } from 'react'
import { removeStudentFromClassroom } from '../actions'
import ConfirmationModal from '@/components/confirmation-modal'

export default function RemoveStudentButton({ classroomId, studentId, onRemoved }: { classroomId: string, studentId: string, onRemoved?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    const result = await removeStudentFromClassroom(classroomId, studentId)
    setLoading(false)
    setIsModalOpen(false)

    if (!result.error) {
      onRemoved?.()
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsModalOpen(true)}
        className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
      >
        {loading ? 'Removing...' : 'Remove'}
      </button>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRemove}
        title="Remove Student"
        message="Are you sure you want to remove this student from the classroom?"
        confirmText="Remove"
        isDangerous={true}
      />
    </>
  )
}
