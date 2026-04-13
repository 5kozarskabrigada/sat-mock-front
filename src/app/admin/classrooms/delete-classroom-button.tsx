'use client'

import { useState } from 'react'
import { deleteClassroom } from './actions'
import ConfirmationModal from '@/components/confirmation-modal'

export default function DeleteClassroomButton({ classroomId, onDeleted }: { classroomId: string, onDeleted?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteClassroom(classroomId)
    setLoading(false)
    setIsModalOpen(false)

    if (!result.error) {
      onDeleted?.()
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsModalOpen(true)}
        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Classroom"
        message="Are you sure you want to delete this classroom? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </>
  )
}
