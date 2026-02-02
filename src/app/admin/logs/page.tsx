import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminLogsPage() {
  const supabase = await createClient()

  const { data: logs, error: fetchError } = await supabase
    .from('activity_logs')
    .select(`
      *,
      users (
        first_name,
        last_name,
        username
      ),
      exams (
        title
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (fetchError) {
      return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <h2 className="text-lg font-bold mb-2">Error loading logs</h2>
              <p>{fetchError.message}</p>
          </div>
      )
  }

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
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {log.users?.first_name} {log.users?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">@{log.users?.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.exams?.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogTypeColor(log.type)}`}>
                    {getLogTypeLabel(log.type)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {log.details}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
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
