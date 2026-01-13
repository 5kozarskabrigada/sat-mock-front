
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import CreateClassroomForm from './create-classroom-form'
import DeleteClassroomButton from './delete-classroom-button'

export default async function ClassroomsPage() {
  const supabase = await createClient()

  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*, student_classrooms(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Classroom Management</h1>
      </div>
      
      <CreateClassroomForm />

      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">All Classrooms</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {classrooms?.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">No classrooms found. Create one to get started.</li>
          ) : (
            classrooms?.map((classroom) => (
              <li key={classroom.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                      <Link href={`/admin/classrooms/${classroom.id}`} className="block focus:outline-none">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-indigo-600 truncate">{classroom.name}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {classroom.student_classrooms[0].count} Students
                                </span>
                            </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                {classroom.description || 'No description'}
                                </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>Created {new Date(classroom.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                      </Link>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                      <DeleteClassroomButton classroomId={classroom.id} />
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
