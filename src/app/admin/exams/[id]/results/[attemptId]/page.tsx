
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { calculateDomainScores } from '@/lib/score-calculator'
import DownloadReportButton from './download-button'

export default async function ScoreReportPage({ params }: { params: { id: string, attemptId: string } }) {
  const supabase = await createClient()
  const { id, attemptId } = await params

  // Fetch attempt details
  const { data: attempt } = await supabase
    .from('student_exams')
    .select(`
      *,
      users (
        first_name,
        last_name,
        username
      ),
      exams (
        title
      )
    `)
    .eq('id', attemptId)
    .single()

  if (!attempt) notFound()

  // Fetch answers
  const { data: answers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('student_exam_id', attemptId)

  // Fetch questions for this exam to get domain info
  const { data: questions } = await supabase
    .from('questions')
    .select('id, domain, content, correct_answer')
    .eq('exam_id', id)

  // Calculate stats
  const domainStats = calculateDomainScores(questions || [], answers || [])
  const totalQuestions = questions?.length || 0
  const correctCount = answers?.filter((a: any) => a.is_correct).length || 0
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/admin/exams/${id}/results`} className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Results</Link>
        <DownloadReportButton 
            studentName={`${attempt.users.first_name} ${attempt.users.last_name}`}
            examTitle={attempt.exams.title}
        />
      </div>

      <div id="score-report" className="bg-white shadow-lg sm:rounded-lg overflow-hidden border border-gray-200 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">{attempt.exams.title}</h1>
            <p className="text-center text-gray-500 mt-2">Score Report</p>
            
            <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                    <p className="text-sm text-gray-500">Student</p>
                    <p className="text-lg font-medium text-gray-900">{attempt.users.first_name} {attempt.users.last_name}</p>
                    <p className="text-xs text-gray-400">@{attempt.users.username}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Date Taken</p>
                    <p className="text-lg font-medium text-gray-900">{new Date(attempt.completed_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>

        {/* Total Score */}
        <div className="text-center mb-10">
            <div className="inline-block p-6 rounded-full border-4 border-indigo-600">
                <span className="text-5xl font-bold text-indigo-600">{scorePercentage}%</span>
            </div>
            <p className="mt-4 text-gray-600">{correctCount} Correct out of {totalQuestions} Questions</p>
        </div>

        {/* Domain Analysis */}
        <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Domain Performance</h3>
            <div className="space-y-4">
                {domainStats.map((stat) => (
                    <div key={stat.name} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{stat.name}</span>
                            <span className="font-bold text-gray-900">{stat.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full ${
                                    stat.percentage >= 80 ? 'bg-green-600' : 
                                    stat.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${stat.percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">{stat.correct}/{stat.total} Correct</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Question Breakdown (Optional / Summary) */}
        {/* Can add detailed question list if needed, but user asked for "clear visualizations of performance by domain" */}
      </div>
    </div>
  )
}
