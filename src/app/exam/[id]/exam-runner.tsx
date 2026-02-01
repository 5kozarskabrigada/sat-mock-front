'use client'

import { useState, useEffect, useMemo } from 'react'
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

// Module Configuration
const MODULE_CONFIG = [
    { id: 'rw1', title: 'Section 1, Module 1: Reading and Writing', type: 'rw', duration: 32 * 60 },
    { id: 'rw2', title: 'Section 1, Module 2: Reading and Writing', type: 'rw', duration: 32 * 60 },
    { id: 'break', title: 'Break', type: 'break', duration: 10 * 60 },
    { id: 'm1', title: 'Section 2, Module 1: Math', type: 'math', duration: 35 * 60 },
    { id: 'm2', title: 'Section 2, Module 2: Math', type: 'math', duration: 35 * 60 },
]

export default function ExamRunner({ 
  exam, 
  questions: allQuestions, 
  studentExamId,
  studentName 
}: { 
  exam: any
  questions: any[]
  studentExamId: string
  studentName: string
}) {
  const router = useRouter()
  
  // -- State --
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({})
  const [allHighlights, setAllHighlights] = useState<Record<string, any[]>>({})
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(MODULE_CONFIG[0].duration)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  // View State
  const [view, setView] = useState<'question' | 'review'>('question')

  // Modal States
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isReferenceOpen, setIsReferenceOpen] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isAnnotateActive, setIsAnnotateActive] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam_answers_${studentExamId}`)
    const savedMarked = localStorage.getItem(`exam_marked_${studentExamId}`)
    const savedHighlights = localStorage.getItem(`exam_highlights_${studentExamId}`)
    
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers))
    if (savedMarked) setMarkedQuestions(JSON.parse(savedMarked))
    if (savedHighlights) setAllHighlights(JSON.parse(savedHighlights))
  }, [studentExamId])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`exam_answers_${studentExamId}`, JSON.stringify(answers))
  }, [studentExamId, answers])

  useEffect(() => {
    localStorage.setItem(`exam_marked_${studentExamId}`, JSON.stringify(markedQuestions))
  }, [studentExamId, markedQuestions])

  useEffect(() => {
    localStorage.setItem(`exam_highlights_${studentExamId}`, JSON.stringify(allHighlights))
  }, [studentExamId, allHighlights])

  // -- Derived Data --
  const modules = useMemo(() => {
      // Filter questions for each module
      // We assume questions have 'section' and 'module' properties
      // If not, we might need to distribute them if the DB doesn't have it (fallback)
      
      const rw1 = allQuestions.filter(q => q.section === 'reading_writing' && q.module === 1)
      const rw2 = allQuestions.filter(q => q.section === 'reading_writing' && q.module === 2)

      // Math section specific filter: Remove passage-based MCQ questions
      const mathFilter = (q: any) => {
          const isMultipleChoice = q.content?.options && q.content?.options.A
          const hasPassage = !!q.content?.passage
          if (isMultipleChoice && hasPassage) return false
          return true
      }

      const m1 = allQuestions.filter(q => q.section === 'math' && q.module === 1).filter(mathFilter)
      const m2 = allQuestions.filter(q => q.section === 'math' && q.module === 2).filter(mathFilter)
      
      return [
          { ...MODULE_CONFIG[0], questions: rw1 },
          { ...MODULE_CONFIG[1], questions: rw2 },
          { ...MODULE_CONFIG[2], questions: [] }, // Break
          { ...MODULE_CONFIG[3], questions: m1 },
          { ...MODULE_CONFIG[4], questions: m2 },
      ]
  }, [allQuestions])

  const currentModule = modules[currentModuleIndex]
  const currentModuleQuestions = currentModule.questions

  // -- Timer Logic --
  useEffect(() => {
    if (!isTimerRunning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleModuleTimeUp() // Auto-advance
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerRunning, currentModuleIndex])

  // -- Handlers --

  const handleModuleTimeUp = () => {
      // Time is up for the current module. Submit it and move to next.
      handleFinishModule()
  }

  const handleFinishModule = async () => {
      if (currentModuleIndex >= modules.length - 1) {
          // Final Submit
          await submitExam(studentExamId, answers)
          router.push('/student/completed')
      } else {
          // Move to next module
          const nextIndex = currentModuleIndex + 1
          setCurrentModuleIndex(nextIndex)
          setCurrentQuestionIndex(0)
          setTimeLeft(modules[nextIndex].duration)
          setView('question')
          setShowSubmitConfirm(false)
          
          // If next is Break, ensure timer runs (or maybe user wants to start break manually? Standard is auto)
      }
  }

  const handleResumeFromBreak = () => {
      handleFinishModule() // Move from Break to next section
  }

  const handleAnswerChange = (value: any) => {
    const qId = currentModuleQuestions[currentQuestionIndex].id
    setAnswers(prev => ({
      ...prev,
      [qId]: value
    }))
  }

  const handleToggleMark = () => {
    const qId = currentModuleQuestions[currentQuestionIndex].id
    setMarkedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < currentModuleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
        // Last question -> go to Review
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

  // -- Render --

  if (allQuestions.length === 0) {
    return <div className="p-10 text-center">No questions in this exam.</div>
  }

  // 1. Break Screen
  if (currentModule.type === 'break') {
      return <BreakScreen timeLeft={timeLeft} onResume={handleResumeFromBreak} />
  }

  // 2. Exam Screen
  const currentQuestion = currentModuleQuestions[currentQuestionIndex]
  const isMathSection = currentModule.type === 'math'

  return (
    <div className="flex flex-col h-screen bg-[var(--sat-bg)] overflow-hidden font-sans text-[var(--sat-text)]">
      <ExamHeader 
          title={currentModule.title} 
          timeLeft={timeLeft}
          onReviewClick={() => setView('review')}
          showMathTools={isMathSection}
          onCalculatorClick={() => setIsCalculatorOpen(true)}
          onReferenceClick={() => setIsReferenceOpen(true)}
          isAnnotateActive={isAnnotateActive}
          onAnnotateClick={() => setIsAnnotateActive(!isAnnotateActive)}
      />

      <main className="flex-1 overflow-hidden relative">
          {view === 'question' && currentQuestion ? (
              <QuestionViewer 
                  question={currentQuestion}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={currentModuleQuestions.length}
                  selectedAnswer={answers[currentQuestion.id]}
                  onAnswerChange={handleAnswerChange}
                  isMathSection={isMathSection}
                  isMarked={!!markedQuestions[currentQuestion.id]}
                  onToggleMark={handleToggleMark}
                  isAnnotateActive={isAnnotateActive}
                  highlights={allHighlights[currentQuestion.id] || []}
                  onHighlightsChange={(highlights) => setAllHighlights(prev => ({ ...prev, [currentQuestion.id]: highlights }))}
              />
          ) : (
              <ReviewScreen 
                  questions={currentModuleQuestions}
                  answers={answers}
                  currentQuestionIndex={currentQuestionIndex}
                  onNavigate={handleNavigate}
                  markedQuestions={markedQuestions}
                  onSubmit={() => setShowSubmitConfirm(true)}
                  onBackToQuestion={() => setView('question')}
                  actionLabel={currentModuleIndex >= modules.length - 1 ? "Submit Exam" : "Next Section"}
              />
          )}
      </main>

      {view === 'question' && (
          <ExamFooter 
              studentName={studentName}
              currentQuestionIndex={currentQuestionIndex}
              questions={currentModuleQuestions} 
              onNext={handleNext}
              onBack={handleBack}
              onToggleMark={handleToggleMark}
              onSubmit={() => setShowSubmitConfirm(true)}
              onNavigate={handleNavigate}
              answers={answers}
              markedQuestions={markedQuestions}
              onReviewClick={() => setView('review')}
          />
      )}

      {/* Submit/Finish Section Confirmation Modal */}
      {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                      {currentModuleIndex >= modules.length - 1 ? "Finish Exam?" : "Finish This Section?"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                      {currentModuleIndex >= modules.length - 1 
                        ? "You are about to submit your exam. You will not be able to change your answers after this."
                        : "You are about to finish this module. You will NOT be able to return to these questions once you move to the next section."
                      }
                  </p>
                  <div className="flex justify-end space-x-3">
                      <button 
                          onClick={() => setShowSubmitConfirm(false)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleFinishModule}
                          className="px-4 py-2 rounded-lg bg-[var(--sat-primary)] text-white hover:bg-blue-700 font-medium"
                      >
                          {currentModuleIndex >= modules.length - 1 ? "Submit Exam" : "Move to Next Section"}
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
