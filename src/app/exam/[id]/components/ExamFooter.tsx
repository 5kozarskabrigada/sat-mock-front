
'use client'

import { useRef, useEffect, useState } from 'react'

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

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate Module Progress
  const currentModule = questions[currentQuestionIndex]?.module || 1
  const moduleQuestions = questions.filter(q => (q.module || 1) == currentModule)
  const currentQuestionInModule = moduleQuestions.findIndex(q => q.id === currentQuestionId) + 1
  const sectionTitle = `Section 1, Module ${currentModule}: Reading and Writing Questions` // Dynamic based on subject later

  return (
    <>
      {/* Dashed Line Decoration */}
      <div 
        className="h-[4px] w-full"
        style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #0077c8, #0077c8 45px, transparent 45px, transparent 55px, #00a651 55px, #00a651 100px, transparent 100px, transparent 110px, #ed1c24 110px, #ed1c24 155px, transparent 155px, transparent 165px, #662d91 165px, #662d91 210px, transparent 210px, transparent 220px)'
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
        <div className="flex-1 flex justify-center relative">
            <button 
                onClick={() => setIsModalOpen(!isModalOpen)} 
                className="bg-black text-white px-4 py-2 rounded-lg text-[14px] font-bold flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            >
                <span>Question {currentQuestionInModule} of {moduleQuestions.length}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${isModalOpen ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Question Navigation Modal */}
            {isModalOpen && (
                <div className="absolute bottom-full mb-4 w-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50 transform -translate-x-0">
                    {/* Pointer */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 rotate-45"></div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-black font-serif">{sectionTitle}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600 font-sans border-b border-gray-100 pb-4">
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black">
                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span>Current</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded border border-dashed border-black"></div>
                            <span>Unanswered</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                                <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                            </svg>
                            <span>For Review</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-10 gap-3 mb-8">
                        {moduleQuestions.map((q, idx) => {
                            const globalIndex = questions.findIndex(gq => gq.id === q.id)
                            const isCurrent = globalIndex === currentQuestionIndex
                            const isMarked = markedQuestions[q.id]
                            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== ''
                            
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => {
                                        onNavigate(globalIndex)
                                        setIsModalOpen(false)
                                    }}
                                    className={`
                                        relative h-10 w-10 flex items-center justify-center rounded text-sm font-medium transition-all
                                        ${isCurrent 
                                            ? 'border-2 border-dashed border-black bg-white' 
                                            : 'border border-gray-200 hover:bg-gray-50'
                                        }
                                        ${isAnswered && !isCurrent ? 'bg-gray-100 text-black' : ''}
                                    `}
                                >
                                    {/* Pin for Current */}
                                    {isCurrent && (
                                        <div className="absolute -top-1.5 -left-1.5 bg-white rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
                                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {/* Flag for Review */}
                                    {isMarked && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-600">
                                                <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}

                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer Action */}
                    <div className="flex justify-center">
                        <button 
                            className="px-6 py-2 rounded-full border border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
                            onClick={() => {
                                // Logic to go to review page - for now just close
                                setIsModalOpen(false)
                            }}
                        >
                            Go to Review Page
                        </button>
                    </div>
                </div>
            )}
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
