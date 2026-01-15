
'use client'

import { useRef, useEffect } from 'react'

export default function ExamFooter({ 
  studentName, 
  currentQuestionIndex, 
  questions,
  onNext, 
  onBack,
  onToggleMark,
  onSubmit,
  onNavigate,
  answers,
  markedQuestions
}: { 
  studentName: string
  currentQuestionIndex: number
  questions: any[]
  onNext: () => void
  onBack: () => void
  onToggleMark: () => void
  onSubmit: () => void
  onNavigate: (index: number) => void
  answers: Record<string, any>
  markedQuestions: Record<string, boolean>
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll active question into view
  useEffect(() => {
    if (scrollContainerRef.current) {
        const activeBtn = scrollContainerRef.current.children[currentQuestionIndex] as HTMLElement
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }
  }, [currentQuestionIndex])

  const currentQuestionId = questions[currentQuestionIndex]?.id
  const isCurrentMarked = markedQuestions[currentQuestionId]

  return (
    <>
      {/* Dashed Line Decoration */}
      <div className="h-[2px] w-full flex">
          {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-1 h-full flex">
                  <div className="h-full w-1/4 bg-green-500"></div>
                  <div className="h-full w-1/4 bg-red-500"></div>
                  <div className="h-full w-1/4 bg-blue-500"></div>
                  <div className="h-full w-1/4 bg-purple-500"></div>
              </div>
          ))}
      </div>

      <footer 
        className="flex items-center justify-between px-6 bg-[var(--sat-panel)] z-20 relative select-none"
        style={{ height: '72px' }}
      >
        {/* Left: User Info */}
        <div className="flex items-center space-x-3 w-1/4">
            <div className="font-bold text-[14px] text-[var(--sat-text)]">
                {studentName}
            </div>
        </div>

        {/* Center: Question Navigation Pill */}
        <div className="flex-1 flex justify-center">
            <button 
                onClick={() => {}} // Could trigger dropdown
                className="bg-black text-white px-4 py-1.5 rounded-full text-[14px] font-bold flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            >
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* Right: Back/Next Buttons */}
        <div className="flex items-center justify-end space-x-3 w-1/4">
          <button 
            onClick={onBack}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-1.5 rounded-[4px] bg-[var(--sat-primary)] text-white font-bold text-[14px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
          >
            Back
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
             <button 
                onClick={onSubmit}
                className="px-6 py-1.5 rounded-[4px] bg-[var(--sat-primary)] text-white font-bold text-[14px] hover:bg-blue-700 transition-colors min-w-[80px]"
             >
                 Submit
             </button>
          ) : (
              <button 
                onClick={onNext}
                className="px-6 py-1.5 rounded-[4px] bg-[var(--sat-primary)] text-white font-bold text-[14px] hover:bg-blue-700 transition-colors min-w-[80px]"
              >
                Next
              </button>
          )}
        </div>
      </footer>
    </>
  )
}

function NavButton({ index, isActive, isAnswered, isMarked, onClick }: any) {
    // Note: This is no longer used in the main footer view but could be used in the "More" dropdown
    return null
}
