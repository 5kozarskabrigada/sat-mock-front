
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { calculateDomainScores, calculateRWScoreByModule, calculateMathScoreByModule } from '@/lib/score-calculator'
import DownloadReportButton from './download-button'
import type { PdfBreakdownSection, PdfBreakdownQuestion } from './download-button'

type AnswerRecord = {
  questionId: string
  isCorrect: boolean | null
  answerValue: string | null
}

type QuestionRecord = {
  id: string
  domain: string
  correctAnswer: string
  section: 'reading_writing' | 'math'
  module: number
  content: unknown
}

export default async function ScoreReportPage({ params }: { params: { id: string, attemptId: string } }) {
  const { id, attemptId } = await params

  // Fetch attempt details
  const attempt = await prisma.studentExam.findUnique({
    where: { id: attemptId },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      exam: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!attempt) notFound()

  // Fetch answers
  const answers = await prisma.studentAnswer.findMany({
    where: { studentExamId: attemptId },
  })

  // Fetch questions for this exam to get domain info (exclude soft-deleted)
  const questions = await prisma.question.findMany({
    where: { examId: id, deletedAt: null },
    select: { id: true, domain: true, content: true, correctAnswer: true, section: true, module: true },
    orderBy: { createdAt: 'asc' },
  })

  const typedQuestions: QuestionRecord[] = (questions || []) as QuestionRecord[]
  const typedAnswers: AnswerRecord[] = (answers || []) as AnswerRecord[]

  // Calculate stats
  const domainStats = calculateDomainScores(typedQuestions, typedAnswers)
  
  // SAT Score Calculation using Albert.io conversion tables
  const rwQuestions = typedQuestions.filter((question) => question.section === 'reading_writing')
  const mathQuestions = typedQuestions.filter((question) => question.section === 'math')
  
  // Calculate module-level stats first (needed for Albert.io-style scoring)
  const rwM1Questions = typedQuestions.filter((question) => question.section === 'reading_writing' && question.module === 1)
  const rwM2Questions = typedQuestions.filter((question) => question.section === 'reading_writing' && question.module === 2)
  const mathM1Questions = typedQuestions.filter((question) => question.section === 'math' && question.module === 1)
  const mathM2Questions = typedQuestions.filter((question) => question.section === 'math' && question.module === 2)
  
  const rwM1Correct = typedAnswers.filter((answer) => answer.isCorrect && rwM1Questions.some((question) => question.id === answer.questionId)).length
  const rwM2Correct = typedAnswers.filter((answer) => answer.isCorrect && rwM2Questions.some((question) => question.id === answer.questionId)).length
  const mathM1Correct = typedAnswers.filter((answer) => answer.isCorrect && mathM1Questions.some((question) => question.id === answer.questionId)).length
  const mathM2Correct = typedAnswers.filter((answer) => answer.isCorrect && mathM2Questions.some((question) => question.id === answer.questionId)).length

  const rwCorrect = rwM1Correct + rwM2Correct
  const mathCorrect = mathM1Correct + mathM2Correct
  
  // Use Albert.io score conversion with per-module scoring: (M1 + M2 - 200)
  const rwScore = calculateRWScoreByModule(rwM1Correct, rwM2Correct)
  const mathScore = calculateMathScoreByModule(mathM1Correct, mathM2Correct)
  const totalScore = rwScore + mathScore
  const moduleSummaries = [
    { label: 'R&W Module 1', correct: rwM1Correct, total: rwM1Questions.length },
    { label: 'R&W Module 2', correct: rwM2Correct, total: rwM2Questions.length },
    { label: 'Math Module 1', correct: mathM1Correct, total: mathM1Questions.length },
    { label: 'Math Module 2', correct: mathM2Correct, total: mathM2Questions.length },
  ].filter((summary) => summary.total > 0)
  const completedDate = attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not completed'
  const breakdownSections: PdfBreakdownSection[] = MODULE_GROUPS.flatMap((group) => {
    const moduleQuestions = typedQuestions.filter(
      (question) => question.section === group.section && question.module === group.module,
    )

    if (moduleQuestions.length === 0) {
      return []
    }

    const questions: PdfBreakdownQuestion[] = moduleQuestions.map((question, index) => {
      const answer = typedAnswers.find((entry) => entry.questionId === question.id)
      const result: PdfBreakdownQuestion['result'] = answer?.isCorrect ? 'Correct' : answer ? 'Incorrect' : 'Skipped'

      return {
        number: index + 1,
        domain: question.domain,
        correctAnswer: question.correctAnswer,
        studentAnswer: answer?.answerValue || '(Skipped)',
        result,
      }
    })

    return [{
      label: group.label,
      correct: questions.filter((question) => question.result === 'Correct').length,
      total: questions.length,
      questions,
    }]
  })

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-8">
      <div className="flex items-center justify-between print:hidden max-w-5xl mx-auto w-full">
        <Link href={`/admin/exams/${id}/results`} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Results
        </Link>
        <DownloadReportButton 
            studentName={`${attempt.student.firstName} ${attempt.student.lastName}`}
          username={attempt.student.username || ''}
            examTitle={attempt.exam.title}
          completedDate={completedDate}
          totalScore={totalScore}
          rwScore={rwScore}
          mathScore={mathScore}
          rwCorrect={rwCorrect}
          rwTotal={rwQuestions.length}
          mathCorrect={mathCorrect}
          mathTotal={mathQuestions.length}
          overallCorrect={rwCorrect + mathCorrect}
          overallTotal={rwQuestions.length + mathQuestions.length}
          violations={attempt.lockdownViolations}
          readingWritingDomains={domainStats.filter((stat) => DOMAINS.reading_writing.includes(stat.name))}
          mathDomains={domainStats.filter((stat) => DOMAINS.math.includes(stat.name))}
          moduleSummaries={moduleSummaries}
          breakdownSections={breakdownSections}
        />
      </div>

      <div id="submission-results-pdf" className="space-y-6 max-w-5xl mx-auto w-full">
        <div id="score-report" className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          {/* Official-style Header */}
          <div className="bg-gray-900 text-white p-8">
              <div className="flex justify-between items-start">
                  <div>
                      <h1 className="text-2xl font-bold tracking-tight">SAT Score Report</h1>
                      <p className="text-gray-400 mt-1">{attempt.exam.title}</p>
                  </div>
                  <div className="text-right">
                      <div className="text-3xl font-bold">{totalScore}</div>
                      <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Score</div>
                  </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-8 border-t border-gray-800 pt-8">
                  <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Student</p>
                      <p className="text-lg font-bold">{attempt.student.firstName} {attempt.student.lastName}</p>
                      <p className="text-sm text-gray-400">@{attempt.student.username}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Date</p>
                      <p className="text-lg font-bold">{completedDate}</p>
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
                  
                  {domainStats.some((d: any) => DOMAINS.reading_writing.includes(d.name)) && (
                  <div className="mt-6 space-y-3">
                      <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Knowledge and Skills</h4>
                      {domainStats.filter((d: any) => DOMAINS.reading_writing.includes(d.name)).map((stat: any) => (
                          <div key={stat.name} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{stat.name}</span>
                              <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                      <div className={`h-1.5 rounded-full ${stat.percentage >= 70 ? 'bg-green-500' : stat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stat.percentage}%` }}></div>
                                  </div>
                                  <span className="text-xs font-medium w-8 text-right">{stat.percentage}%</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  )}
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

                  {domainStats.some((d: any) => DOMAINS.math.includes(d.name)) && (
                  <div className="mt-6 space-y-3">
                      <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Knowledge and Skills</h4>
                      {domainStats.filter((d: any) => DOMAINS.math.includes(d.name)).map((stat: any) => (
                          <div key={stat.name} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{stat.name}</span>
                              <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                      <div className={`h-1.5 rounded-full ${stat.percentage >= 70 ? 'bg-green-500' : stat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stat.percentage}%` }}></div>
                                  </div>
                                  <span className="text-xs font-medium w-8 text-right">{stat.percentage}%</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  )}
              </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Teacher Summary</h3>
          </div>
          <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium">Reading & Writing</p>
                      <p className="text-xl font-bold text-gray-900">{rwCorrect}/{rwQuestions.length}</p>
                      <p className="text-xs text-gray-400">questions correct</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium">Math</p>
                      <p className="text-xl font-bold text-gray-900">{mathCorrect}/{mathQuestions.length}</p>
                      <p className="text-xs text-gray-400">questions correct</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium">Overall</p>
                      <p className="text-xl font-bold text-gray-900">{rwCorrect + mathCorrect}/{rwQuestions.length + mathQuestions.length}</p>
                      <p className="text-xs text-gray-400">total correct</p>
                  </div>
                  <div className={`rounded-lg p-4 border ${attempt.lockdownViolations > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <p className="text-xs text-gray-500 uppercase font-medium">Security</p>
                      <p className={`text-xl font-bold ${attempt.lockdownViolations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {attempt.lockdownViolations > 0 ? attempt.lockdownViolations : 'Clean'}
                      </p>
                      <p className="text-xs text-gray-400">{attempt.lockdownViolations > 0 ? 'violations detected' : 'no violations'}</p>
                  </div>
              </div>
              
              {/* Module Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-4">Module Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {rwM1Questions.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">R&W Module 1</p>
                          <p className="text-lg font-bold text-gray-900">{rwM1Correct}/{rwM1Questions.length}</p>
                      </div>
                      )}
                      {rwM2Questions.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">R&W Module 2</p>
                          <p className="text-lg font-bold text-gray-900">{rwM2Correct}/{rwM2Questions.length}</p>
                      </div>
                      )}
                      {mathM1Questions.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">Math Module 1</p>
                          <p className="text-lg font-bold text-gray-900">{mathM1Correct}/{mathM1Questions.length}</p>
                      </div>
                      )}
                      {mathM2Questions.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">Math Module 2</p>
                          <p className="text-lg font-bold text-gray-900">{mathM2Correct}/{mathM2Questions.length}</p>
                      </div>
                      )}
                  </div>
              </div>
          </div>
        </div>

        {/* Detailed Question Breakdown */}
        <div id="question-breakdown" className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 print:break-before-page">
          <div className="bg-gray-900 text-white p-6 border-b border-gray-800">
              <div>
                  <h3 className="text-xl font-bold">Detailed Question Breakdown</h3>
                  <p className="text-gray-400 text-sm mt-1">Review student answers against correct keys</p>
              </div>
          </div>
        
          {/* Group questions by module */}
          {(() => {
            return MODULE_GROUPS.map((group) => {
              const moduleQuestions = typedQuestions.filter(
                (question) => question.section === group.section && question.module === group.module,
              )
              
              if (moduleQuestions.length === 0) return null
              
              const moduleCorrect = moduleQuestions.filter((question) => {
                const answer = typedAnswers.find((entry) => entry.questionId === question.id)
                return answer?.isCorrect
              }).length
              
              return (
                <div key={`${group.section}-${group.module}`}>
                  <div className="bg-gray-50 px-6 py-3 border-b border-t border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 text-sm">{group.label}</h4>
                    <span className="text-xs font-medium text-gray-500">
                      {moduleCorrect}/{moduleQuestions.length} correct
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Answer</th>
                          <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {moduleQuestions.map((question, idx) => {
                          const answer = typedAnswers.find((entry) => entry.questionId === question.id)
                          const isCorrect = answer?.isCorrect
                          const studentAnswer = answer?.answerValue || '(Skipped)'
                          const isSkipped = !answer
                          
                          return (
                            <tr key={question.id} className={isCorrect ? 'bg-white' : 'bg-red-50/30'}>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{idx + 1}</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-50" title={question.domain}>{question.domain}</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-mono font-bold text-gray-900">{question.correctAnswer}</td>
                              <td className={`px-6 py-3 whitespace-nowrap text-sm font-mono ${isCorrect ? 'text-green-700 font-bold' : 'text-red-600'}`}>
                                {studentAnswer}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-center">
                                {isCorrect ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Correct
                                  </span>
                                ) : isSkipped ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Skipped
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Incorrect
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}

const MODULE_GROUPS = [
  { label: 'Section 1, Module 1: Reading and Writing', section: 'reading_writing', module: 1 },
  { label: 'Section 1, Module 2: Reading and Writing', section: 'reading_writing', module: 2 },
  { label: 'Section 2, Module 1: Math', section: 'math', module: 1 },
  { label: 'Section 2, Module 2: Math', section: 'math', module: 2 },
] as const

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
