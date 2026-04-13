'use client'

import Link from 'next/link'
import SubmissionsSearch from './submissions-search'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { examsAPI, studentExamsAPI } from '@/lib/api-client'

export default function AdminSubmissionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q') || ''

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const loadSubmissions = async () => {
      try {
        const examsRes = await examsAPI.getAll()
        const exams = Array.isArray(examsRes.data) ? examsRes.data : []

        const rows = await Promise.all(
          exams.map((exam: any) => studentExamsAPI.getExamResults(exam.id).then((res) => ({ exam, rows: res.data || [] }))),
        )

        const merged = rows
          .flatMap((entry: any) => entry.rows.map((row: any) => ({ ...row, exam: { id: entry.exam.id, title: entry.exam.title } })))
          .filter((row: any) => row.status === 'completed')
          .sort((a: any, b: any) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())

        setSubmissions(merged)
      } catch (error) {
        console.error('Failed to load submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [authLoading, user, router])

  const filtered = useMemo(() => {
    if (!query) return submissions
    const needle = query.toLowerCase()
    return submissions.filter((sub: any) =>
      `${sub.first_name || ''} ${sub.last_name || ''}`.toLowerCase().includes(needle) ||
      (sub.student_email || '').toLowerCase().includes(needle),
    )
  }, [submissions, query])

  if (authLoading || loading) {
    return <div className="text-center py-12 text-gray-500">Loading submissions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage completed student exam reports.</p>
        </div>
        <Suspense fallback={<div className="h-10 w-64 bg-gray-100 animate-pulse rounded-lg" />}>
          <SubmissionsSearch />
        </Suspense>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sub.completed_at ? new Date(sub.completed_at).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sub.first_name} {sub.last_name}</div>
                  <div className="text-xs text-gray-500">{sub.student_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.exam?.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {(sub.lockdown_violations || 0) > 0 ? (
                      <span className="px-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-red-100 text-red-800 w-fit">
                        {sub.lockdown_violations} Violations
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-green-100 text-green-800 w-fit">
                        Secure
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/exams/${sub.exam?.id}/results/${sub.id}`}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md transition-colors"
                  >
                    View Report
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
