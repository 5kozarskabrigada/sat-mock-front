
import { createClient } from '@/utils/supabase/server'
import CreateStudentModal from './create-student-modal'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage enrolled students and credentials.</p>
        </div>
        <CreateStudentModal />
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Enrolled Students ({students?.length || 0})</h3>
        </div>
        <div className="bg-white">
            <StudentList students={students || []} />
        </div>
      </div>
    </div>
  )
}
