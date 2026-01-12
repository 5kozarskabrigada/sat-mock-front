
import { createClient } from '@/utils/supabase/server'
import AddStudentForm from './add-student-form'
import StudentList from './student-list'

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
            <StudentList students={students || []} />
        </div>
      </div>
    </div>
  )
}
