
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

  // Calculate Module Progress
  const currentModule = questions[currentQuestionIndex]?.module || 1
  const moduleQuestions = questions.filter(q => (q.module || 1) == currentModule)
  const currentQuestionInModule = moduleQuestions.findIndex(q => q.id === currentQuestionId) + 1

  return (
    <>
      {/* Dashed Line Decoration */}
      <div 
        className="h-[4px] w-full"
        style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #0077c8, #0077c8 8px, transparent 8px, transparent 10px, #00a651 10px, #00a651 18px, transparent 18px, transparent 20px, #ed1c24 20px, #ed1c24 28px, transparent 28px, transparent 30px, #662d91 30px, #662d91 38px, transparent 38px, transparent 40px)'
        }}
      ></div>

      <footer 
        className="flex items-center justify-between px-6 bg-[#f0f2f5] z-20 relative select-none"
        style={{ height: '72px' }}
      >
        {/* Left: User Info */}
        <div className="flex items-center space-x-3 w-1/4">
            <div className="font-bold text-[14px] text-black font-serif">
                {studentName}
            </div>
        </div>

        {/* Center: Question Navigation Pill */}
        <div className="flex-1 flex justify-center">
            <button 
                onClick={() => {}} // Could trigger dropdown
                className="bg-black text-white px-4 py-2 rounded-lg text-[14px] font-bold flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            >
                <span>Question {currentQuestionInModule} of {moduleQuestions.length}</span>
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
            className="px-8 py-2 rounded-full bg-[#99a6ea] text-white font-bold text-[15px] hover:bg-[#8896da] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
             <button 
                onClick={onSubmit}
                className="px-8 py-2 rounded-full bg-[#2c42b5] text-white font-bold text-[15px] hover:bg-[#1f3090] transition-colors"
             >
                 Submit
             </button>
          ) : (
              <button 
                onClick={onNext}
                className="px-8 py-2 rounded-full bg-[#2c42b5] text-white font-bold text-[15px] hover:bg-[#1f3090] transition-colors"
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
