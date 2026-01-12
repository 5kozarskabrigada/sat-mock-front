
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
    <footer 
      className="flex items-center justify-between px-6 bg-[var(--sat-panel)] border-t border-[var(--sat-border)] z-20 relative select-none"
      style={{ height: 'clamp(64px, 10vh, 80px)' }}
    >
      {/* Left: Back and Next Buttons */}
      <div className="flex items-center space-x-3 w-1/4">
        <button 
          onClick={onBack}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2.5 rounded-[12px] border border-[var(--sat-primary)] text-[var(--sat-primary)] font-bold text-sm hover:bg-[var(--sat-primary-weak)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button 
          onClick={onNext}
          className="px-6 py-2.5 rounded-[12px] bg-[var(--sat-primary)] text-white font-bold text-sm hover:bg-blue-700 shadow-[var(--sat-shadow)] transition-colors"
        >
          Next
        </button>
      </div>

      {/* Center: Question Navigation Strip */}
      <div className="flex-1 flex justify-center mx-4 overflow-hidden">
        <div 
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto no-scrollbar max-w-full px-2 py-1 items-center"
            style={{ scrollBehavior: 'smooth' }}
        >
            {questions.map((q, idx) => {
                const isActive = idx === currentQuestionIndex
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== ''
                const isMarked = markedQuestions[q.id]
                
                return (
                    <NavButton 
                        key={q.id}
                        index={idx}
                        isActive={isActive}
                        isAnswered={isAnswered}
                        isMarked={isMarked}
                        onClick={() => onNavigate(idx)}
                    />
                )
            })}
        </div>
      </div>

      {/* Right: Mark for Review + Submit */}
      <div className="flex items-center justify-end space-x-4 w-1/4">
         <button 
            onClick={onToggleMark}
            className={`flex items-center space-x-2 font-medium text-sm transition-colors group ${isCurrentMarked ? 'text-[var(--sat-text)]' : 'text-[var(--sat-muted)] hover:text-[var(--sat-text)]'}`}
         >
             <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" fill={isCurrentMarked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isCurrentMarked ? 'text-[var(--sat-red)]' : 'group-hover:text-[var(--sat-red)]'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                 </svg>
             </div>
             <span className={isCurrentMarked ? 'text-[var(--sat-text)] font-bold' : ''}>Mark for Review</span>
         </button>

         {(currentQuestionIndex === questions.length - 1) && (
             <button 
                onClick={onSubmit}
                className="px-4 py-2 rounded-[12px] border border-[var(--sat-border)] text-[var(--sat-text)] font-medium text-sm hover:bg-[var(--sat-bg)] transition-colors"
             >
                 Submit
             </button>
         )}
      </div>
    </footer>
  )
}

function NavButton({ index, isActive, isAnswered, isMarked, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                relative flex items-center justify-center w-8 h-8 rounded-[4px] text-sm font-bold transition-all flex-shrink-0
                ${isActive 
                    ? 'bg-[var(--sat-text)] text-white' 
                    : 'bg-transparent text-[var(--sat-text)] border border-[var(--sat-border)] hover:bg-[var(--sat-bg)]'
                }
            `}
        >
            {index + 1}
            {/* Indicators */}
            {isMarked && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[var(--sat-red)] rounded-full"></div>
            )}
            {isAnswered && !isActive && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[var(--sat-text)] rounded-full"></div>
            )}
        </button>
    )
}
