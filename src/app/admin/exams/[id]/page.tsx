
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddQuestionForm from './add-question-form'
import { toggleExamStatus } from './actions'
import ExamStatusToggle from './exam-status-toggle'
import DeleteExamButton from './delete-exam-button'

export default async function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .single()

  if (!exam) {
    notFound()
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', id)
    .order('created_at', { ascending: true })

  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*')
    .order('name')

  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{exam.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{exam.description}</p>
          </div>
          <div className="flex items-center space-x-4">
             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(exam.status)}`}>
                {exam.status}
             </span>
             {/* Pass the status string, not boolean */}
             <ExamStatusToggle examId={exam.id} status={exam.status} classrooms={classrooms || []} />
             <div className="border-l pl-4 border-gray-200">
                <DeleteExamButton examId={exam.id} />
             </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Exam Code</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono font-bold">{exam.code}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{exam.type}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Questions</h2>
            <Link 
                href={`/admin/exams/${exam.id}/results`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                View Results
            </Link>
        </div>
        
        {/* List Questions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {questions?.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6 text-gray-500">No questions added yet.</li>
                ) : (
                    questions?.map((q, index) => (
                        <li key={q.id} className="px-4 py-4 sm:px-6">
                            <div className="flex justify-between items-start">
                                <div className="text-sm font-medium text-indigo-600">
                                    Q{index + 1} ({q.section === 'reading_writing' ? 'RW' : 'Math'} - M{q.module})
                                    {q.domain && <span className="ml-2 text-xs text-gray-400">[{q.domain}]</span>}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-500">
                                        Answer: {q.correct_answer}
                                    </div>
                                    <Link 
                                        href={`/admin/exams/${exam.id}/questions/${q.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-900">
                                <p className="line-clamp-2">{q.content.question}</p>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>

        <AddQuestionForm examId={exam.id} />
      </div>
    </div>
  )
}
