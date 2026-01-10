
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import CreateExamForm from './create-exam-form'

export default async function ExamsPage() {
  const supabase = await createClient()

  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Exam Management</h1>
        <p className="mt-2 text-sm text-gray-700">Create and manage mock exams and practice sets.</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Exam</h2>
        <CreateExamForm />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Existing Exams</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {exams?.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500">No exams created yet.</li>
          ) : (
            exams?.map((exam) => (
              <li key={exam.id}>
                <Link href={`/admin/exams/${exam.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-indigo-600">{exam.title}</p>
                      <div className="ml-2 flex flex-shrink-0">
                        <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          exam.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {exam.is_active ? 'Active' : 'Draft'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Code: <span className="font-mono font-bold ml-1">{exam.code}</span>
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Type: {exam.type}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Created {new Date(exam.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
