
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats and recent activity in parallel
  const [studentsResult, examsResult, recentStudents, recentExams] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('exams').select('id', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
    supabase.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false }).limit(5),
    supabase.from('exams').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(5)
  ])

  const studentCount = studentsResult.count || 0
  const activeExamCount = examsResult.count || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your SAT Mock Platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Students */}
        <Link href="/admin/students" className="block group">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:shadow-md hover:ring-indigo-300 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-indigo-50 p-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="truncate text-sm font-medium text-gray-500">Total Students</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{studentCount}</dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
                View all students <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Card 2: Exams */}
        <Link href="/admin/exams" className="block group">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:shadow-md hover:ring-green-300 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-green-50 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="truncate text-sm font-medium text-gray-500">Active Exams</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{activeExamCount}</dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm font-medium text-green-600 group-hover:text-green-500">
                Manage exams <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Card 3: Quick Action */}
        <Link href="/admin/exams" className="block group h-full">
           <div className="overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md transition-all duration-200 hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 h-full flex flex-col justify-center items-center text-center p-6 text-white cursor-pointer relative">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="h-12 w-12 mb-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-xl font-bold">Create New Exam</h3>
              <p className="text-indigo-100 text-sm mt-1">Set up a mock test in seconds</p>
           </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Students */}
          <div>
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Recent Students</h2>
                  <Link href="/admin/students" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View All</Link>
              </div>
              <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
                  <ul role="list" className="divide-y divide-gray-200">
                      {recentStudents?.data?.map((student: any) => (
                          <li key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                      {student.first_name?.[0]}{student.last_name?.[0]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                          {student.first_name} {student.last_name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                  </div>
                                  <div className="flex-shrink-0 text-xs text-gray-400">
                                      {new Date(student.created_at).toLocaleDateString()}
                                  </div>
                              </div>
                          </li>
                      ))}
                      {(!recentStudents?.data || recentStudents.data.length === 0) && (
                          <li className="p-4 text-center text-sm text-gray-500">No recent students</li>
                      )}
                  </ul>
              </div>
          </div>

          {/* Recent Exams */}
          <div>
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Recent Exams</h2>
                  <Link href="/admin/exams" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View All</Link>
              </div>
              <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
                  <ul role="list" className="divide-y divide-gray-200">
                      {recentExams?.data?.map((exam: any) => (
                          <li key={exam.id} className="p-4 hover:bg-gray-50 transition-colors">
                              <Link href={`/admin/exams/${exam.id}`} className="block group">
                                  <div className="flex items-center justify-between">
                                      <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                              {exam.title}
                                          </p>
                                          <div className="flex items-center mt-1 space-x-2">
                                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                                  exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                              }`}>
                                                  {exam.status}
                                              </span>
                                              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 rounded">
                                                  {exam.code}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="flex-shrink-0">
                                          <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                      </div>
                                  </div>
                              </Link>
                          </li>
                      ))}
                      {(!recentExams?.data || recentExams.data.length === 0) && (
                          <li className="p-4 text-center text-sm text-gray-500">No recent exams</li>
                      )}
                  </ul>
              </div>
          </div>
      </div>
    </div>
  )
}
