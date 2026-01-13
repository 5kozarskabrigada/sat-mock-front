
'use client'

import { deleteExam, simpleToggleExamStatus } from './[id]/actions'
import { useState } from 'react'

export default function ExamListActions({ exam }: { exam: any }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this exam?')) return
    setLoading(true)
    await deleteExam(exam.id)
    setLoading(false)
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    const result = await simpleToggleExamStatus(exam.id, exam.status)
    if (result?.error) {
        alert(result.error)
    }
    setLoading(false)
  }

  const isActive = exam.status === 'active'

  return (
    <div className="flex space-x-2 mt-4 sm:mt-0 relative z-10">
       <button 
         onClick={handleToggle} 
         disabled={loading} 
         className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            isActive 
            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
         }`}
       >
         {loading ? '...' : (isActive ? 'Active' : 'Inactive')}
       </button>
       <button 
         onClick={handleDelete} 
         disabled={loading} 
         className="px-3 py-1 rounded-md text-xs font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
       >
         {loading ? '...' : 'Delete'}
       </button>
    </div>
  )
}
