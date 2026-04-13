import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminLogsPage() {
  let logs, fetchError
  
  try {
    logs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          }
        },
        exam: {
          select: {
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  } catch (error: any) {
    fetchError = error
  }

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
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {log.user?.firstName} {log.user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">@{log.user?.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.exam?.title}
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
