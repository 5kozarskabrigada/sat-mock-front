
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AddStudentToClassroomForm from './add-student-form'
import RemoveStudentButton from './remove-student-button'
import { notFound } from 'next/navigation'

export default async function ClassroomDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', id)
    .single()

  if (!classroom) {
    notFound()
  }

  const { data: enrolledStudents } = await supabase
    .from('student_classrooms')
    .select('*, users(*)')
    .eq('classroom_id', id)
    .order('joined_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link href="/admin/classrooms" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Classrooms
        </Link>
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{classroom.name}</h1>
                <p className="text-gray-500 mt-2 max-w-2xl">{classroom.description}</p>
            </div>
            <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                <span className="text-indigo-600 font-bold text-xl">{enrolledStudents?.length || 0}</span>
                <span className="text-indigo-600 text-sm font-medium">Students Enrolled</span>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Student List */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">Enrolled Students</h3>
                </div>
                <ul role="list" className="divide-y divide-gray-200 bg-white">
                  {enrolledStudents?.length === 0 ? (
                    <li className="px-6 py-12 text-center text-gray-500">
                        <p>No students enrolled yet.</p>
                        <p className="text-xs mt-1">Use the form to add students to this class.</p>
                    </li>
                  ) : (
                    enrolledStudents?.map((enrollment) => (
                      <li key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                {enrollment.users.first_name?.[0]}{enrollment.users.last_name?.[0]}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{enrollment.users.first_name} {enrollment.users.last_name}</div>
                                <div className="text-xs text-gray-500">@{enrollment.users.username}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-400 hidden sm:inline-block">
                                Joined {new Date(enrollment.joined_at).toLocaleDateString()}
                              </span>
                              <RemoveStudentButton classroomId={id} studentId={enrollment.student_id} />
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
          </div>

          {/* Sidebar: Add Student */}
          <div className="lg:col-span-1">
              <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl p-6 sticky top-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add Student</h3>
                  <AddStudentToClassroomForm classroomId={id} />
              </div>
          </div>
      </div>
    </div>
  )
}
