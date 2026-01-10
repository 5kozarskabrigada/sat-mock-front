
'use client'

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  questions, 
  answers, 
  currentQuestionIndex, 
  onNavigate 
}: { 
  isOpen: boolean
  onClose: () => void
  questions: any[]
  answers: Record<string, any>
  currentQuestionIndex: number
  onNavigate: (index: number) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Section 1, Module 1: Reading and Writing Questions
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-800">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Current</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400"></div>
            <span className="font-medium">Unanswered</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-600">
              <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.58.652l3.109-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.158l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.202.55V21a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">For Review</span>
          </div>
        </div>

        {/* Grid */}
        <div className="p-8 overflow-y-auto bg-white flex-1">
          <div className="grid grid-cols-10 gap-4">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex
              const isAnswered = !!answers[q.id]
              
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onNavigate(idx)
                    onClose()
                  }}
                  className={`
                    relative h-12 w-12 flex items-center justify-center rounded-lg text-lg font-bold transition-all
                    ${isCurrent 
                        ? 'bg-white border-2 border-dashed border-black text-blue-600 ring-2 ring-blue-100' 
                        : isAnswered 
                            ? 'bg-white border border-gray-200 text-blue-600'
                            : 'bg-white border border-dashed border-gray-300 text-blue-600'
                    }
                  `}
                >
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                  )}
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-6 bg-white border-t border-gray-200 flex justify-center">
            <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors"
            >
                Go to Review Page
            </button>
        </div>
      </div>
    </div>
  )
}
