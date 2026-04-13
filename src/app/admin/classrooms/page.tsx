'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { classroomsAPI } from '@/lib/api-client'
import CreateClassroomModal from './create-classroom-modal'
import DeleteClassroomButton from './delete-classroom-button'

export default function ClassroomsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadClassrooms = async () => {
    try {
      const response = await classroomsAPI.getAll()
      setClassrooms(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Failed to load classrooms:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    loadClassrooms()
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classrooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classroom Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create groups and assign students.</p>
        </div>
        <CreateClassroomModal onCreated={loadClassrooms} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classrooms.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new classroom.</p>
          </div>
        ) : (
          classrooms.map((classroom: any) => (
            <div
              key={classroom.id}
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md group"
            >
              <Link href={`/admin/classrooms/${classroom.id}`} className="flex-1 p-6 flex flex-col justify-between hover:bg-gray-50/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {Number(classroom.student_count || 0)} Students
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {classroom.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-10">
                    {classroom.description || 'No description provided.'}
                  </p>
                </div>
              </Link>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Created {new Date(classroom.created_at).toLocaleDateString()}
                </span>
                <DeleteClassroomButton classroomId={classroom.id} onDeleted={loadClassrooms} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
