
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { RestoreExamButton, RestoreQuestionButton, PermanentDeleteExamButton, PermanentDeleteQuestionButton } from './buttons'
import PreviewQuestion from './preview-question'
import PreviewExam from './preview-exam'

export default async function RecycleBinPage() {
  const supabase = await createClient()

  const { data: deletedExams } = await supabase
    .from('exams')
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  const { data: deletedQuestions } = await supabase
    .from('questions')
    .select('*, exams(title)')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recycle Bin</h1>
        <p className="mt-2 text-sm text-gray-700">Restore or permanently delete items.</p>
      </div>

      <div className="space-y-6">
        {/* Deleted Exams */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Deleted Exams</h3>
          </div>
          <div className="border-t border-gray-200">
             <ul role="list" className="divide-y divide-gray-200">
                {!deletedExams || deletedExams.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-gray-500">No deleted exams found.</li>
                ) : (
                    deletedExams.map((exam) => (
                        <li key={exam.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <div className="flex items-center">
                                    <p className="text-sm font-medium text-indigo-600">{exam.title}</p>
                                    <PreviewExam exam={exam} />
                                </div>
                                <p className="text-xs text-gray-500">Deleted {new Date(exam.deleted_at).toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-4">
                                <RestoreExamButton examId={exam.id} />
                                <PermanentDeleteExamButton examId={exam.id} />
                            </div>
                        </li>
                    ))
                )}
             </ul>
          </div>
        </div>

        {/* Deleted Questions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Deleted Questions</h3>
          </div>
          <div className="border-t border-gray-200">
             <ul role="list" className="divide-y divide-gray-200">
                {!deletedQuestions || deletedQuestions.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-gray-500">No deleted questions found.</li>
                ) : (
                    deletedQuestions.map((q) => (
                        <li key={q.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                            <div className="max-w-xl">
                                <div className="flex items-center">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-md">{q.content.question}</p>
                                    <PreviewQuestion question={q} />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Exam: {q.exams?.title || 'Unknown'} | Deleted {new Date(q.deleted_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                <RestoreQuestionButton questionId={q.id} />
                                <PermanentDeleteQuestionButton questionId={q.id} />
                            </div>
                        </li>
                    ))
                )}
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
