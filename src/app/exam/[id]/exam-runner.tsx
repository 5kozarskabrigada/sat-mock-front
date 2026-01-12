
'use client'

import { useState, useEffect } from 'react'
import { submitExam } from './actions'
import { useRouter } from 'next/navigation'
import ExamHeader from './components/ExamHeader'
import ExamFooter from './components/ExamFooter'
import QuestionViewer from './components/QuestionViewer'
import ReviewScreen from './components/ReviewScreen'
import BreakScreen from './components/BreakScreen'
import CalculatorModal from './components/CalculatorModal'
import ReferenceSheetModal from './components/ReferenceSheetModal'

// Helper to determine if a question is Math
const isMath = (q: any) => {
  return q.section === 'math' || (q.domain && q.domain.toLowerCase().includes('math'))
}

export default function ExamRunner({ 
  exam, 
  questions, 
  studentExamId,
  studentName 
}: { 
  exam: any
  questions: any[]
  studentExamId: string
  studentName: string
}) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(isMath(questions[0]) ? 35 * 60 : 32 * 60) // Default 32 mins for R&W, 35 for Math
  
  // View State
  const [view, setView] = useState<'question' | 'review'>('question')

  // Modal States
  const [isBreakOpen, setIsBreakOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isReferenceOpen, setIsReferenceOpen] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isAnnotateActive, setIsAnnotateActive] = useState(false)

  // Timer
  useEffect(() => {
    if (isBreakOpen) return // Pause timer during break (if desired, or keep running)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleSubmit() // Auto-submit
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isBreakOpen])

  const handleAnswerChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: value
    }))
  }

  const handleToggleMark = () => {
    const questionId = questions[currentQuestionIndex].id
    setMarkedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
        // If last question, maybe go to review? 
        // User said: "Back/Next navigate through questions."
        // Usually Next on last question does nothing or goes to Review.
        setView('review')
    }
  }

  const handleBack = () => {
    if (view === 'review') {
        setView('question')
        return
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleNavigate = (index: number) => {
      setCurrentQuestionIndex(index)
      setView('question')
  }

  const handleSubmit = async () => {
    await submitExam(studentExamId, answers)
    router.push('/student/completed')
  }

  if (questions.length === 0) {
    return <div className="p-10 text-center">No questions in this exam.</div>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isMathSection = isMath(currentQuestion)
  // Derive section title dynamically
  const sectionTitle = isMathSection 
    ? 'Section 2, Module 1: Math' 
    : 'Section 1, Module 1: Reading and Writing'

  if (isBreakOpen) {
    return <BreakScreen timeLeft={600} onResume={() => setIsBreakOpen(false)} />
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--sat-bg)] overflow-hidden font-sans text-[var(--sat-text)]">
      <ExamHeader 
          title={sectionTitle} 
          timeLeft={timeLeft}
          onReviewClick={() => setView('review')} // Header review button
          showMathTools={isMathSection}
          onCalculatorClick={() => setIsCalculatorOpen(true)}
          onReferenceClick={() => setIsReferenceOpen(true)}
          isAnnotateActive={isAnnotateActive}
          onAnnotateClick={() => setIsAnnotateActive(!isAnnotateActive)}
      />

      <main className="flex-1 overflow-hidden relative">
          {view === 'question' ? (
              <QuestionViewer 
                  question={currentQuestion}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  selectedAnswer={answers[currentQuestion.id]}
                  onAnswerChange={handleAnswerChange}
                  isMathSection={isMathSection}
                  isMarked={!!markedQuestions[currentQuestion.id]}
                  onToggleMark={handleToggleMark}
                  isAnnotateActive={isAnnotateActive}
              />
          ) : (
              <ReviewScreen 
                  questions={questions}
                  answers={answers}
                  currentQuestionIndex={currentQuestionIndex}
                  onNavigate={handleNavigate}
                  markedQuestions={markedQuestions}
                  onSubmit={handleSubmit}
                  onBackToQuestion={() => setView('question')}
              />
          )}
      </main>

      {view === 'question' && (
          <ExamFooter 
              studentName={studentName}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions} // Passing full questions array
              onNext={handleNext}
              onBack={handleBack}
              onToggleMark={handleToggleMark}
              onSubmit={() => setShowSubmitConfirm(true)}
              onNavigate={handleNavigate}
              answers={answers}
              markedQuestions={markedQuestions}
          />
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Finish This Section?</h3>
                  <p className="text-gray-600 mb-6">
                      You are about to finish this section. You will be able to review your answers on the next screen before final submission.
                  </p>
                  <div className="flex justify-end space-x-3">
                      <button 
                          onClick={() => setShowSubmitConfirm(false)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={() => {
                              setShowSubmitConfirm(false)
                              setView('review')
                          }}
                          className="px-4 py-2 rounded-lg bg-[var(--sat-primary)] text-white hover:bg-blue-700 font-medium"
                      >
                          Yes, Go to Review
                      </button>
                  </div>
              </div>
          </div>
      )}

      <CalculatorModal 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      <ReferenceSheetModal 
        isOpen={isReferenceOpen} 
        onClose={() => setIsReferenceOpen(false)} 
      />
    </div>
  )
}
