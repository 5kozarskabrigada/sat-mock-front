
'use client'

import { useState, useEffect } from 'react'
import { submitExam } from './actions'
import { useRouter } from 'next/navigation'
import ExamHeader from './components/ExamHeader'
import ExamFooter from './components/ExamFooter'
import QuestionViewer from './components/QuestionViewer'
import ReviewModal from './components/ReviewModal'
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
  
  // Modal States
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isBreakOpen, setIsBreakOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isReferenceOpen, setIsReferenceOpen] = useState(false)

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
        // If last question, maybe show review modal or confirm submit?
        // For now, let's open review modal on last "Next"
        setIsReviewOpen(true)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
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
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      <ExamHeader 
        title={sectionTitle} 
        timeLeft={timeLeft}
        onReviewClick={() => setIsReviewOpen(true)}
        showMathTools={isMathSection}
        onCalculatorClick={() => setIsCalculatorOpen(true)}
        onReferenceClick={() => setIsReferenceOpen(true)}
      />

      <main className="flex-1 overflow-hidden relative">
        <QuestionViewer 
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
          isMathSection={isMathSection}
          isMarked={!!markedQuestions[currentQuestion.id]}
          onToggleMark={handleToggleMark}
        />
      </main>

      <ExamFooter 
        studentName={studentName}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onNext={handleNext}
        onBack={handleBack}
        onReviewClick={() => setIsReviewOpen(true)}
      />

      {/* Modals */}
      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        questions={questions}
        answers={answers}
        currentQuestionIndex={currentQuestionIndex}
        onNavigate={setCurrentQuestionIndex}
        markedQuestions={markedQuestions}
      />
      
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
