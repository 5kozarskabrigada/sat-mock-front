
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ExamResultsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: exam } = await supabase
    .from('exams')
    .select('title')
    .eq('id', id)
    .single()

  if (!exam) notFound()

  // Fetch completed exams
  const { data: results } = await supabase
    .from('student_exams')
    .select(`
      id,
      started_at,
      completed_at,
      status,
      score,
      users (
        first_name,
        last_name,
        username
      )
    `)
    .eq('exam_id', id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <Link href={`/admin/exams/${id}`} className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Exam Details</Link>
            <h1 className="text-2xl font-bold text-gray-900">Results: {exam.title}</h1>
          </div>
       </div>

       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Student Submissions</h3>
          </div>
          <div className="border-t border-gray-200">
             <ul role="list" className="divide-y divide-gray-200">
                {!results || results.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-gray-500">No completed submissions yet.</li>
                ) : (
                    results.map((result: any) => (
                        <li key={result.id} className="hover:bg-gray-50">
                            <Link href={`/admin/exams/${id}/results/${result.id}`} className="block px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {result.users?.first_name?.[0]}{result.users?.last_name?.[0]}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {result.users?.first_name} {result.users?.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">@{result.users?.username}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {/* Calculate simple score if jsonb is empty or specific format */}
                                                {/* For now, just show "View Report" */}
                                                View Report
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Completed {new Date(result.completed_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))
                )}
             </ul>
          </div>
       </div>
    </div>
  )
}
