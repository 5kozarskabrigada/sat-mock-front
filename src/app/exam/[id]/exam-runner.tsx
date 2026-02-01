'use client'

import { useState, useEffect, useMemo } from 'react'
import { submitExam, logLockdownViolation, logExamStarted } from './actions'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const isAdminPreview = searchParams.get('preview') === 'true'
  
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
  const [showHighlightsSummary, setShowHighlightsSummary] = useState(false)
  const [showLockdownWarning, setShowLockdownWarning] = useState(false)
  const [lockdownViolations, setLockdownViolations] = useState(0)
  const [isDisqualified, setIsDisqualified] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam_answers_${studentExamId}`)
    const savedMarked = localStorage.getItem(`exam_marked_${studentExamId}`)
    const savedHighlights = localStorage.getItem(`exam_highlights_${studentExamId}`)
    
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers))
    if (savedMarked) setMarkedQuestions(JSON.parse(savedMarked))
    if (savedHighlights) setAllHighlights(JSON.parse(savedHighlights))

    // Log exam start (only if not already logged in this session)
    if (!isAdminPreview) {
      const hasLoggedStart = sessionStorage.getItem(`exam_started_logged_${studentExamId}`)
      if (!hasLoggedStart) {
        logExamStarted(studentExamId)
        sessionStorage.setItem(`exam_started_logged_${studentExamId}`, 'true')
      }
    }
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

  // -- Lockdown Browser Logic --
  useEffect(() => {
    if (isAdminPreview) return // No lockdown for admins

    const handleViolation = async () => {
        if (isDisqualified) return

        setLockdownViolations(prev => prev + 1)
        
        if (exam.lockdown_policy === 'disqualify') {
            setIsDisqualified(true)
            setShowLockdownWarning(true)
            await logLockdownViolation(studentExamId, 'Student disqualified for lockdown violation')
            // Auto submit
            await submitExam(studentExamId, answers)
        } else {
            setShowLockdownWarning(true)
            await logLockdownViolation(studentExamId)
        }
    }

    const handleBlur = () => {
        handleViolation()
    }

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !showLockdownWarning) {
            handleViolation()
        }
    }

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        // Block F12 (DevTools)
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault()
        }
        // Block PrintScreen
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('') // Clear clipboard
            alert("Screenshots are disabled.")
        }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Request Fullscreen on first click
    const enterFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.warn("Fullscreen request failed", e)
            })
        }
    }

    document.addEventListener('click', enterFullscreen, { once: true })

    return () => {
        window.removeEventListener('blur', handleBlur)
        window.removeEventListener('contextmenu', handleContextMenu)
        window.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        document.removeEventListener('click', enterFullscreen)
    }
  }, [isAdminPreview, studentExamId, showLockdownWarning])

  const requestFullscreen = () => {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {
              console.warn("Fullscreen request failed", e)
          })
      }
  }

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
          if (!isAdminPreview) {
              await submitExam(studentExamId, answers)
              router.push('/student/completed')
          } else {
              alert("Admin Preview: Submission disabled.")
              router.push('/admin/exams/' + exam.id)
          }
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
          onShowHighlightsSummary={() => setShowHighlightsSummary(!showHighlightsSummary)}
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

      {/* Lockdown Warning Modal */}
      {showLockdownWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-red-600">
                  <div className="flex items-center justify-center mb-6">
                      <div className="bg-red-100 p-3 rounded-full">
                          <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                      </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center uppercase tracking-tight">
                    {isDisqualified ? "Disqualified!" : "Security Alert!"}
                  </h3>
                  <p className="text-gray-700 mb-6 text-center leading-relaxed">
                      {isDisqualified 
                        ? "You have been disqualified for leaving the exam environment. Your exam has been submitted and this incident has been logged."
                        : "You have attempted to leave the exam environment. This incident has been logged."
                      }
                      <span className="block mt-4 font-bold text-red-600">Violation Count: {lockdownViolations}</span>
                  </p>
                  
                  {isDisqualified ? (
                    <button 
                        onClick={() => router.push('/student/completed')}
                        className="w-full py-4 rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-lg shadow-lg transition-transform active:scale-95"
                    >
                        Exit Exam
                    </button>
                  ) : (
                    <button 
                        onClick={() => {
                            setShowLockdownWarning(false);
                            requestFullscreen();
                        }}
                        className="w-full py-4 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-lg shadow-lg transition-transform active:scale-95"
                    >
                        I Understand, Resume Exam
                    </button>
                  )}
              </div>
          </div>
      )}

      {/* Highlights Summary Panel */}
      {showHighlightsSummary && (
          <div className="fixed right-4 top-24 bottom-24 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900 font-serif">Highlights Summary</h3>
                  <button onClick={() => setShowHighlightsSummary(false)} className="text-gray-400 hover:text-gray-600 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {Object.entries(allHighlights).some(([_, h]) => h.length > 0) ? (
                      Object.entries(allHighlights).map(([qId, highlights]) => {
                          if (highlights.length === 0) return null
                          const question = allQuestions.find(q => q.id === qId)
                          const qIdx = currentModuleQuestions.findIndex(q => q.id === qId)
                          
                          return (
                              <div key={qId} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Question {qIdx + 1}</span>
                                      {qIdx !== -1 && (
                                          <button 
                                              onClick={() => { handleNavigate(qIdx); setShowHighlightsSummary(false); }}
                                              className="text-xs text-blue-600 hover:underline"
                                          >
                                              Go to Question
                                          </button>
                                      )}
                                  </div>
                                  <div className="space-y-2">
                                      {highlights.map((h, i) => {
                                          // Extract text from innerHTML if possible, or just show a snippet
                                          // Since we store innerHTML, we can parse it
                                          return (
                                              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm italic text-gray-700 leading-relaxed line-clamp-3">
                                                  {/* Extract text from HTML string */}
                                                  {typeof h === 'string' ? h.replace(/<[^>]*>/g, '') : 'Highlight ' + (i + 1)}
                                              </div>
                                          )
                                      })}
                                  </div>
                              </div>
                          )
                      })
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          <p className="text-sm font-medium">No highlights yet.</p>
                          <p className="text-xs">Use the tool to mark important text.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  )
}
