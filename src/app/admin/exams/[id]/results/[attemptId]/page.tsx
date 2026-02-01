
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
    .select('id, domain, content, correct_answer, section')
    .eq('exam_id', id)

  // Calculate stats
  const domainStats = calculateDomainScores(questions || [], answers || [])
  
  // SAT Score Calculation
  const rwQuestions = questions?.filter(q => q.section === 'reading_writing') || []
  const mathQuestions = questions?.filter(q => q.section === 'math') || []
  
  const rwCorrect = answers?.filter(a => a.is_correct && rwQuestions.some(q => q.id === a.question_id)).length || 0
  const mathCorrect = answers?.filter(a => a.is_correct && mathQuestions.some(q => q.id === a.question_id)).length || 0
  
  const calculateScore = (correct: number, total: number) => {
      if (total === 0) return 200;
      // Linear scaling for mock purposes: 200 base + (ratio * 600)
      return Math.round((200 + (correct / total) * 600) / 10) * 10;
  }
  
  const rwScore = calculateScore(rwCorrect, rwQuestions.length)
  const mathScore = calculateScore(mathCorrect, mathQuestions.length)
  const totalScore = rwScore + mathScore

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-8">
      <div className="flex items-center justify-between print:hidden max-w-5xl mx-auto w-full">
        <Link href={`/admin/exams/${id}/results`} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Results
        </Link>
        <DownloadReportButton 
            studentName={`${attempt.users.first_name} ${attempt.users.last_name}`}
            examTitle={attempt.exams.title}
        />
      </div>

      <div id="score-report" className="bg-white shadow-xl rounded-xl overflow-hidden max-w-5xl mx-auto border border-gray-100">
        {/* Official-style Header */}
        <div className="bg-gray-900 text-white p-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">SAT Score Report</h1>
                    <p className="text-gray-400 mt-1">{attempt.exams.title}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold">{totalScore}</div>
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Score</div>
                </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-gray-800 pt-8">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Student</p>
                    <p className="text-lg font-bold">{attempt.users.first_name} {attempt.users.last_name}</p>
                    <p className="text-sm text-gray-400">@{attempt.users.username}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Date</p>
                    <p className="text-lg font-bold">{new Date(attempt.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {attempt.lockdown_violations > 0 && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            {attempt.lockdown_violations} Security Violations
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reading and Writing Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Reading and Writing</h3>
                    <span className="text-2xl font-bold text-gray-900">{rwScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${(rwScore - 200) / 6}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 text-right">200–800</p>
                
                <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Knowledge and Skills</h4>
                    {domainStats.filter(d => DOMAINS.reading_writing.includes(d.name) || !DOMAINS.math.includes(d.name)).map(stat => (
                        DOMAINS.reading_writing.includes(stat.name) && (
                        <div key={stat.name} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{stat.name}</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${stat.percentage >= 70 ? 'bg-green-500' : stat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stat.percentage}%` }}></div>
                                </div>
                                <span className="text-xs font-medium w-8 text-right">{stat.percentage}%</span>
                            </div>
                        </div>
                        )
                    ))}
                </div>
            </div>

            {/* Math Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Math</h3>
                    <span className="text-2xl font-bold text-gray-900">{mathScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${(mathScore - 200) / 6}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 text-right">200–800</p>

                <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Knowledge and Skills</h4>
                    {domainStats.map(stat => (
                        DOMAINS.math.includes(stat.name) && (
                        <div key={stat.name} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{stat.name}</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${stat.percentage >= 70 ? 'bg-green-500' : stat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stat.percentage}%` }}></div>
                                </div>
                                <span className="text-xs font-medium w-8 text-right">{stat.percentage}%</span>
                            </div>
                        </div>
                        )
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

const DOMAINS = {
  math: [
    "Algebra",
    "Advanced Math",
    "Problem-Solving and Data Analysis",
    "Geometry and Trigonometry"
  ],
  reading_writing: [
    "Craft and Structure",
    "Information and Ideas",
    "Standard English Conventions",
    "Expression of Ideas"
  ]
}
