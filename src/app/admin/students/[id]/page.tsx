'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { examsAPI, studentExamsAPI, usersAPI } from '@/lib/api-client'

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [student, setStudent] = useState<any | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const id = params?.id as string

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        const [studentRes, examsRes] = await Promise.all([
          usersAPI.getById(id),
          examsAPI.getAll(),
        ])

        if (!studentRes.data) {
          router.push('/admin/students')
          return
        }

        const examRows = Array.isArray(examsRes.data) ? examsRes.data : []
        const allResults = await Promise.all(
          examRows.map((exam: any) => studentExamsAPI.getExamResults(exam.id).then((res) => ({ exam, rows: res.data || [] }))),
        )

        const studentSubmissions = allResults
          .flatMap((entry: any) => entry.rows.map((row: any) => ({ ...row, exam: { id: entry.exam.id, title: entry.exam.title } })))
          .filter((row: any) => row.student_id === id)
          .sort((a: any, b: any) => {
            const aDate = new Date(a.completed_at || a.started_at).getTime()
            const bDate = new Date(b.completed_at || b.started_at).getTime()
            return bDate - aDate
          })

        setStudent({
          ...studentRes.data,
          firstName: studentRes.data.first_name,
          lastName: studentRes.data.last_name,
        })
        setSubmissions(studentSubmissions)
      } catch (error) {
        console.error('Failed to load student profile:', error)
        router.push('/admin/students')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [authLoading, user, router, id])

  if (authLoading || loading || !student) {
    return <div className="text-center py-12 text-gray-500">Loading student profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/students" className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Students</Link>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile: {student.firstName} {student.lastName}</h1>
        <p className="text-sm text-gray-500">@{student.username}</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Exam Submissions</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {submissions.length === 0 ? (
              <li className="px-4 py-5 sm:px-6 text-gray-500">No submissions yet.</li>
            ) : (
              submissions.map((sub: any) => (
                <li key={sub.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">{sub.exam?.title}</p>
                      <p className="text-xs text-gray-500">
                        {sub.status === 'completed'
                          ? `Completed on ${new Date(sub.completed_at).toLocaleString()}`
                          : `Started on ${new Date(sub.started_at).toLocaleString()} (In Progress)`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {(sub.lockdown_violations || 0) > 0 && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {sub.lockdown_violations} Violations
                        </span>
                      )}
                      {sub.status === 'completed' && (
                        <Link
                          href={`/admin/exams/${sub.exam?.id}/results/${sub.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Report
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
