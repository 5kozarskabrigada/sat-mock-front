
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditQuestionForm from './edit-question-form'

export default async function EditQuestionPage({ params }: { params: { id: string, questionId: string } }) {
  const supabase = await createClient()
  const { id, questionId } = await params

  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

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
