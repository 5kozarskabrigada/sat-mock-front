
'use client'

export default function ExamFooter({ 
  studentName, 
  currentQuestionIndex, 
  totalQuestions, 
  onNext, 
  onBack,
  onReviewClick
}: { 
  studentName: string
  currentQuestionIndex: number
  totalQuestions: number
  onNext: () => void
  onBack: () => void
  onReviewClick: () => void
}) {
  return (
    <footer className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-6 relative z-20">
      <div className="text-gray-500 font-sans text-sm font-medium">
        {studentName}
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <button 
          onClick={onReviewClick}
          className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors"
        >
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      <div className="flex space-x-3">
        <button 
          onClick={onBack}
          className="px-6 py-2 rounded-full bg-blue-500 text-white font-sans font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          disabled={currentQuestionIndex === 0}
        >
          Back
        </button>
        <button 
          onClick={onNext}
          className="px-6 py-2 rounded-full bg-indigo-600 text-white font-sans font-medium text-sm hover:bg-indigo-700 shadow-sm transition-colors"
        >
          Next
        </button>
      </div>
    </footer>
  )
}
