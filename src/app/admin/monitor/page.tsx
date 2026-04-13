import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/get-current-user'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function MonitorPage() {
  // Verify Admin Access
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (user.role !== 'admin' && user.role !== 'teacher') {
    redirect('/student')
  }

  // Fetch active sessions
  const activeSessions = await prisma.studentExam.findMany({
    where: { status: 'in_progress' },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          code: true,
        }
      },
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Calculate "Online" status based on updatedAt (heartbeat every 60s)
  // If updatedAt is within last 2 minutes, consider online.
  const isOnline = (dateStr: string | Date) => {
      const lastUpdate = new Date(dateStr).getTime()
      const now = Date.now()
      return (now - lastUpdate) < 2 * 60 * 1000 // 2 minutes
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Exam Monitor</h1>
                <p className="mt-1 text-sm text-gray-500">Real-time view of active student sessions</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors">
                Refresh
            </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            {activeSessions && activeSessions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activeSessions.map((session: any) => {
                            const online = isOnline(session.updatedAt)
                            return (
                                <tr key={session.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                {session.student?.firstName?.[0]}{session.student?.lastName?.[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {session.student?.firstName} {session.student?.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {session.student?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">{session.exam?.title}</div>
                                        <div className="text-xs text-gray-500 font-mono">{session.exam?.code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(session.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            online ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            <span className={`w-2 h-2 mr-1.5 rounded-full ${online ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                                            {online ? 'Active' : 'Idle'}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Last seen: {new Date(session.updatedAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/exams/${session.exam?.id}/results/${session.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
                    <p className="mt-1 text-sm text-gray-500">There are currently no students taking exams.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
