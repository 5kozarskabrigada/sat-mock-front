
import { prisma } from '@/lib/prisma'
import CreateExamModal from './create-exam-modal'
import ExamListFilter from './exam-list-filter'

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  })

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
