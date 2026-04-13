
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditQuestionForm from './edit-question-form'
import { prisma } from '@/lib/prisma'

export default async function EditQuestionPage({ params }: { params: { id: string, questionId: string } }) {
  const { id, questionId } = await params

  const question = await prisma.question.findUnique({
    where: { id: questionId, deletedAt: null }
  })

  if (!question) {
    notFound()
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <Link href={`/admin/exams/${id}`} className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Exam</Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          </div>
       </div>

       <EditQuestionForm question={question} examId={id} />
    </div>
  )
}
