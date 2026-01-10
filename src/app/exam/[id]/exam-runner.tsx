
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Question = {
  id: string
  section: string
  module: number
  content: any
}

type ExamRunnerProps = {
  exam: any
  questions: Question[]
  studentExamId: string
}

const SECTIONS = [
  { id: 'rw1', name: 'Reading & Writing Module 1', time: 32 * 60, section: 'reading_writing', module: 1 },
  { id: 'rw2', name: 'Reading & Writing Module 2', time: 32 * 60, section: 'reading_writing', module: 2 },
  { id: 'break', name: 'Break', time: 10 * 60, section: 'break', module: 0 },
  { id: 'm1', name: 'Math Module 1', time: 35 * 60, section: 'math', module: 1 },
  { id: 'm2', name: 'Math Module 2', time: 35 * 60, section: 'math', module: 2 },
]

export default function ExamRunner({ exam, questions, studentExamId }: ExamRunnerProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SECTIONS[0].time)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentSection = SECTIONS[currentSectionIndex]
  
  // Filter questions for current section
  const sectionQuestions = questions.filter(
    q => q.section === currentSection.section && q.module === currentSection.module
  )

  const currentQuestion = sectionQuestions[currentQuestionIndex]

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSectionComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentSectionIndex])

  const handleSectionComplete = useCallback(async () => {
    // Save all answers for this section (if not already saved incrementally)
    // Move to next section
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
      setTimeLeft(SECTIONS[currentSectionIndex + 1].time)
      setCurrentQuestionIndex(0)
      setIsReviewMode(false)
    } else {
      await finishExam()
    }
  }, [currentSectionIndex])

  const finishExam = async () => {
    setIsSubmitting(true)
    await supabase
      .from('student_exams')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', studentExamId)
    
    router.push('/student/completed')
  }

  const handleAnswerSelect = async (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
    
    // Save to DB (optimistic or debounced)
    await supabase.from('student_answers').upsert({
      student_exam_id: studentExamId,
      question_id: currentQuestion.id,
      answer_value: answer
    }, { onConflict: 'student_exam_id, question_id' })
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (currentSection.id === 'break') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Break Time</h1>
        <p className="text-xl mb-8">Take a rest. The next section will start automatically.</p>
        <div className="text-6xl font-mono font-bold text-indigo-600 mb-8">
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={handleSectionComplete}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Skip Break
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex-none h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-gray-900">Section {currentSectionIndex + 1}: {currentSection.name}</span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            className="text-gray-600 hover:text-gray-900 underline"
            onClick={() => setIsReviewMode(!isReviewMode)}
          >
            {isReviewMode ? 'Back to Question' : 'Review'}
          </button>
          <div className="font-mono font-bold text-xl w-20 text-center">
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={handleSectionComplete}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
          >
            {currentSectionIndex === SECTIONS.length - 1 ? 'Finish Exam' : 'Next Section'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        {isReviewMode ? (
          <div className="w-full p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Review Your Answers</h2>
            <div className="grid grid-cols-5 gap-4">
              {sectionQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx)
                    setIsReviewMode(false)
                  }}
                  className={`p-4 rounded border flex flex-col items-center justify-center ${
                    answers[q.id] 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-lg">{idx + 1}</span>
                  <span className="text-xs mt-1">
                    {answers[q.id] ? 'Answered' : 'Unanswered'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          sectionQuestions.length > 0 ? (
            <div className="flex w-full h-full">
              {/* Left Panel: Passage (if exists) */}
              <div className="w-1/2 border-r border-gray-200 p-8 overflow-y-auto bg-gray-50 font-serif text-lg leading-relaxed">
                {currentQuestion?.content.passage ? (
                  <div className="prose max-w-none">
                    <p>{currentQuestion.content.passage}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 italic">
                    No passage for this question.
                  </div>
                )}
              </div>

              {/* Right Panel: Question & Options */}
              <div className="w-1/2 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-2 text-sm text-gray-500 font-medium">
                    Question {currentQuestionIndex + 1} of {sectionQuestions.length}
                  </div>
                  
                  <div className="text-lg font-medium text-gray-900 mb-8 leading-relaxed">
                    {currentQuestion?.content.question}
                  </div>

                  <div className="space-y-4">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[currentQuestion?.id] === option
                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-bold mr-3">{option}</span>
                        {currentQuestion?.content.options[option]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons (Bottom) */}
                <div className="fixed bottom-0 right-0 w-1/2 bg-white border-t border-gray-200 p-4 flex justify-between items-center px-8">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => {
                            if (currentQuestionIndex < sectionQuestions.length - 1) {
                                setCurrentQuestionIndex(prev => prev + 1)
                            } else {
                                setIsReviewMode(true)
                            }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                        {currentQuestionIndex === sectionQuestions.length - 1 ? 'Review Section' : 'Next'}
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">No questions in this section</h3>
                    <button onClick={handleSectionComplete} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Skip Section</button>
                </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
