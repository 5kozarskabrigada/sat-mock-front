
'use client'

import { useState } from 'react'
import { deleteStudent, updateStudent } from './actions'
import ConfirmationModal from '@/components/confirmation-modal'

export default function StudentList({ students }: { students: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredStudents = students.filter(student => 
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdate = async (formData: FormData) => {
      if (editingId) {
          await updateStudent(editingId, formData)
          setEditingId(null)
      }
  }

  const handleDelete = async () => {
      if (deleteId) {
          await deleteStudent(deleteId)
          setDeleteId(null)
      }
  }

  return (
    <div>
        <ConfirmationModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Delete Student"
            message="Are you sure you want to delete this student? This action cannot be undone."
            confirmText="Delete"
            isDangerous={true}
        />

        <div className="mb-4">
            <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <ul role="list" className="divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
                <li className="px-4 py-4 sm:px-6 text-gray-500">No students found.</li>
            ) : (
                filteredStudents.map((student) => (
                <li key={student.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    {editingId === student.id ? (
                        <form action={handleUpdate} className="flex gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">First Name</label>
                                <input type="text" name="firstName" defaultValue={student.first_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-1 border text-black" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Last Name</label>
                                <input type="text" name="lastName" defaultValue={student.last_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-1 border text-black" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">New Password (Optional)</label>
                                <input type="text" name="password" placeholder="Leave empty to keep" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-1 border text-black" />
                            </div>
                            <div className="flex space-x-2">
                                <button type="submit" className="text-green-600 hover:text-green-900 text-sm font-medium">Save</button>
                                <button type="button" onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="truncate">
                                <div className="flex text-sm">
                                <p className="font-medium text-indigo-600 truncate">{student.username}</p>
                                <p className="ml-1 shrink-0 font-normal text-gray-500">
                                    {student.first_name} {student.last_name}
                                </p>
                                </div>
                                <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                    Joined {new Date(student.created_at).toLocaleDateString()}
                                </div>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button onClick={() => setEditingId(student.id)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                <button onClick={() => setDeleteId(student.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    )}
                </li>
                ))
            )}
        </ul>
    </div>
  )
}
