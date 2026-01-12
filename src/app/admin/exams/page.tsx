
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import CreateExamForm from './create-exam-form'

export default async function ExamsPage() {
  const supabase = await createClient()

  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="mt-2 text-sm text-gray-700">Create, edit, and manage your mock exams.</p>
        </div>
      </div>

      {/* Modern Card Grid for Exams */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create New Card */}
        <div className="group relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
           <CreateExamForm />
        </div>

        {/* Existing Exams Cards */}
        {exams?.map((exam) => (
          <Link 
            key={exam.id} 
            href={`/admin/exams/${exam.id}`}
            className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-indigo-300"
          >
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exam.status}
                  </div>
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {exam.code}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                    {exam.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {exam.description || 'No description provided.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize px-2 py-1 bg-gray-50 rounded text-xs border border-gray-100">
                  {exam.type}
                </span>
                <span>
                  {new Date(exam.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
