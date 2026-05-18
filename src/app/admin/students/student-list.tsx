
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteStudent, updateStudent } from './actions'
import ConfirmationModal from '@/components/confirmation-modal'

interface StudentListProps {
  students: any[];
  onUpdate?: () => void;
}

export default function StudentList({ students, onUpdate }: StudentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredStudents = students.filter((student: any) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (student.username || '').toLowerCase().includes(lowerSearch) ||
      (student.first_name || '').toLowerCase().includes(lowerSearch) ||
      (student.last_name || '').toLowerCase().includes(lowerSearch)
    );
  });

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingId) return;

      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const password = formData.get('password') as string;

      const data: any = { firstName, lastName };
      if (password && password.trim()) {
        data.password = password;
      }

      const result = await updateStudent(editingId, data);
      setLoading(false);

      if (result.success) {
        setEditingId(null);
        if (onUpdate) onUpdate();
      } else if (result.error) {
        alert(result.error);
      }
  }

  const handleDelete = async () => {
      if (!deleteId) return;

      setLoading(true);
      const result = await deleteStudent(deleteId);
      setLoading(false);
      setDeleteId(null);

      if (result.success) {
        if (onUpdate) onUpdate();
      } else if (result.error) {
        alert(result.error);
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

        {/* Modern Search Bar */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or username..."
              className="block w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-6 py-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new student.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredStudents.map((student: any) => (
                <div key={student.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200">
                  {editingId === student.id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">First Name</label>
                          <input type="text" name="firstName" defaultValue={student.first_name} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2 border text-black focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Last Name</label>
                          <input type="text" name="lastName" defaultValue={student.last_name} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2 border text-black focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">New Password (Optional)</label>
                        <input type="text" name="password" placeholder="Leave empty to keep current" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm text-sm p-2 border text-black focus:border-indigo-500 focus:ring-indigo-500" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Save Changes</button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <Link href={`/admin/students/${student.id}`} className="block mb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                  {student.first_name} {student.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">@{student.username || 'No username'}</p>
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Active
                          </span>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(student.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                          </button>
                          <button onClick={() => setDeleteId(student.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
