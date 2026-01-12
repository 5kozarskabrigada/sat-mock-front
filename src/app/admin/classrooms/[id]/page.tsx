
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AddStudentToClassroomForm from './add-student-form'
import { removeStudentFromClassroom } from '../actions'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <Link href="/admin/classrooms" className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Classrooms</Link>
            <h1 className="text-2xl font-semibold text-gray-900">{classroom.name}</h1>
            <p className="text-gray-500 mt-1">{classroom.description}</p>
        </div>
      </div>
      
      <AddStudentToClassroomForm classroomId={id} />

      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Enrolled Students ({enrolledStudents?.length || 0})</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {enrolledStudents?.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">No students enrolled yet.</li>
          ) : (
            enrolledStudents?.map((enrollment) => (
              <li key={enrollment.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {enrollment.users.first_name?.[0]}{enrollment.users.last_name?.[0]}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{enrollment.users.first_name} {enrollment.users.last_name}</div>
                        <div className="text-sm text-gray-500">@{enrollment.users.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-4">Joined {new Date(enrollment.joined_at).toLocaleDateString()}</span>
                      <form action={async () => {
                          'use server'
                          await removeStudentFromClassroom(id, enrollment.student_id)
                      }}>
                          <button type="submit" className="text-red-600 hover:text-red-900 font-medium">Remove</button>
                      </form>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
