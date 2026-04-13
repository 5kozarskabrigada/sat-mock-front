import Link from 'next/link'
import SubmissionsSearch from './submissions-search'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (await searchParams)?.q || ''

  const submissions = await prisma.studentExam.findMany({
    where: {
      status: 'completed',
      ...(query ? {
        student: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ]
        }
      } : {})
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        }
      },
      exam: {
        select: {
          title: true,
          id: true,
        }
      }
    },
    orderBy: { completedAt: 'desc' }
  })

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
            {submissions?.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sub.completedAt ? new Date(sub.completedAt).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sub.student?.firstName} {sub.student?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">@{sub.student?.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sub.exam?.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {sub.lockdownViolations > 0 ? (
                        <span className="px-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-red-100 text-red-800 w-fit">
                        {sub.lockdownViolations} Violations
                        </span>
                    ) : (
                        <span className="px-2 inline-flex text-[10px] leading-4 font-bold rounded-full bg-green-100 text-green-800 w-fit">
                        Secure
                        </span>
                    )}
                    {(sub.score as any)?.total !== undefined && (
                        <span className="text-xs font-bold text-indigo-600">
                            Score: {(sub.score as any).total}
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
            {(!submissions || submissions.length === 0) && (
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
