
import { createClient } from '@/utils/supabase/server'
import AddStudentForm from './add-student-form'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
      </div>
      
      <AddStudentForm />

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Enrolled Students</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {students?.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500">No students found.</li>
            ) : (
              students?.map((student) => (
                <li key={student.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 truncate">{student.username}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          {student.first_name} {student.last_name}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          Joined {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </div>
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
