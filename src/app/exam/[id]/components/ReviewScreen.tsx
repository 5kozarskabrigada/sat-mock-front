'use client'

export default function ReviewScreen({ 
  questions, 
  answers, 
  currentQuestionIndex, 
  onNavigate,
  markedQuestions,
  onSubmit,
  onBackToQuestion,
  actionLabel
}: { 
  questions: any[]
  answers: Record<string, any>
  currentQuestionIndex: number
  onNavigate: (index: number) => void
  markedQuestions: Record<string, boolean>
  onSubmit: () => void
  onBackToQuestion: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <div className="px-10 py-6 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold font-serif text-gray-900 text-center">
          Section 1, Module 1: Reading and Writing Questions
        </h2>
        <p className="text-center text-gray-500 mt-2">
            Click on any question to return to it.
        </p>
      </div>

      {/* Legend */}
      <div className="px-10 py-4 bg-gray-50 border-b border-gray-200 flex justify-center space-x-8 text-sm">
        <div className="flex items-center space-x-2 text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-800">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Current</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <div className="w-5 h-5 rounded border-2 border-dashed border-gray-400"></div>
          <span className="font-medium">Unanswered</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
            <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">For Review</span>
        </div>
      </div>

      {/* Grid */}
      <div className="p-10 overflow-y-auto flex-1 bg-white">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-6 max-w-5xl mx-auto">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestionIndex
            const isAnswered = !!answers[q.id]
            const isMarked = markedQuestions[q.id]
            
            return (
              <button
                key={q.id}
                onClick={() => {
                  onNavigate(idx)
                  onBackToQuestion()
                }}
                className={`
                  relative h-14 w-14 flex items-center justify-center rounded-lg text-lg font-bold transition-all shadow-sm
                  ${isCurrent 
                      ? 'bg-white border-[3px] border-dashed border-black text-blue-600 ring-2 ring-blue-100' 
                      : isAnswered 
                          ? 'bg-white border-[3px] border-solid border-green-600 text-blue-600'
                          : 'bg-white border-[3px] border-dotted border-gray-400 text-blue-600'
                  }
                  hover:shadow-md
                `}
              >
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                  </div>
                )}
                
                {isMarked && (
                   <div className="absolute -top-1 -right-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                         <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                      </svg>
                   </div>
                )}

                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-center pb-20">
          {/* Typically "Finish Section" or similar. For now "Submit Exam" if it's the end */}
          <button 
              onClick={onSubmit}
              className="px-12 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:scale-105"
          >
              {actionLabel || 'Finish Section'}
          </button>
      </div>
    </div>
  )
}
