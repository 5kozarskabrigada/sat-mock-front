
import { createClient } from '@/utils/supabase/server'
import CreateExamModal from './create-exam-modal'
import ExamListFilter from './exam-list-filter'

export default async function ExamsPage() {
  const supabase = await createClient()

  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="mt-2 text-sm text-gray-700">Create, edit, and manage your mock exams.</p>
        </div>
        <CreateExamModal />
      </div>

      <ExamListFilter exams={exams || []} />
    </div>
  )
}
