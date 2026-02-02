import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: student } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) notFound()

  const { data: submissions } = await supabase
    .from('student_exams')
    .select(`
      *,
      exams (
        title,
        id
      )
    `)
    .eq('student_id', id)
    .order('completed_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/students" className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Students</Link>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile: {student.first_name} {student.last_name}</h1>
        <p className="text-sm text-gray-500">@{student.username}</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Exam Submissions</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {!submissions || submissions.length === 0 ? (
              <li className="px-4 py-5 sm:px-6 text-gray-500">No submissions yet.</li>
            ) : (
              submissions.map((sub: any) => (
                <li key={sub.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">{sub.exams?.title}</p>
                      <p className="text-xs text-gray-500">
                        {sub.status === 'completed' 
                          ? `Completed on ${new Date(sub.completed_at).toLocaleString()}`
                          : `Started on ${new Date(sub.started_at).toLocaleString()} (In Progress)`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {sub.lockdown_violations > 0 && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {sub.lockdown_violations} Violations
                        </span>
                      )}
                      {sub.status === 'completed' && (
                        <Link 
                          href={`/admin/exams/${sub.exams?.id}/results/${sub.id}`}
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
