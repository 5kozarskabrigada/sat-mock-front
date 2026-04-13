'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { activityLogsAPI, usersAPI } from '@/lib/api-client'

export default function AdminLogsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    const loadLogs = async () => {
      try {
        const [logsRes, usersRes] = await Promise.all([
          activityLogsAPI.getAll(),
          usersAPI.getAll(),
        ])

        const users = Array.isArray(usersRes.data) ? usersRes.data : []
        const userById = new Map(users.map((u: any) => [u.id, u]))

        const rows = (Array.isArray(logsRes.data) ? logsRes.data : [])
          .slice(0, 100)
          .map((log: any) => {
            const u = userById.get(log.user_id)
            return {
              ...log,
              createdAt: log.created_at,
              user: u
                ? { firstName: u.first_name, lastName: u.last_name, username: u.username }
                : null,
              exam: { title: log.exam_title },
            }
          })

        setLogs(rows)
      } catch (error: any) {
        setFetchError(error?.response?.data?.message || error.message || 'Failed to load logs')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [authLoading, user, router])

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'lockdown_violation': return 'text-red-600 bg-red-50'
      case 'exam_disqualified': return 'text-orange-600 bg-orange-50 font-bold'
      case 'exam_joined': return 'text-purple-600 bg-purple-50'
      case 'exam_started': return 'text-green-600 bg-green-50'
      case 'exam_completed': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'lockdown_violation': return 'Security Violation'
      case 'exam_disqualified': return 'Disqualified'
      case 'exam_joined': return 'Joined Exam'
      case 'exam_started': return 'Exam Started'
      case 'exam_completed': return 'Exam Submitted'
      default: return type
    }
  }

  if (authLoading || loading) {
    return <div className="text-center py-12 text-gray-500">Loading logs...</div>
  }

  if (fetchError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h2 className="text-lg font-bold mb-2">Error loading logs</h2>
        <p>{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor student activities and security alerts.</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User'}
                  </div>
                  <div className="text-xs text-gray-500">{log.user ? `@${log.user.username}` : log.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.exam?.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogTypeColor(log.type)}`}>
                    {getLogTypeLabel(log.type)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No activity logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
