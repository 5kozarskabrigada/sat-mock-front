'use client'

import { useState } from 'react'
import Logo from '@/components/Logo'

export default function ExamHeader({ 
  title, 
  timeLeft, 
  onReviewClick, 
  showMathTools,
  onCalculatorClick,
  onReferenceClick,
  isAnnotateActive,
  onAnnotateClick,
  onShowHighlightsSummary
}: { 
  title: string
  timeLeft: number
  onReviewClick: () => void
  showMathTools?: boolean
  onCalculatorClick?: () => void
  onReferenceClick?: () => void
  isAnnotateActive?: boolean
  onAnnotateClick?: () => void
  onShowHighlightsSummary?: () => void
}) {
  const [isTimerHidden, setIsTimerHidden] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Timer Color Logic
  const getTimerColor = () => {
    if (timeLeft < 60) return 'text-[var(--sat-red)]'
    if (timeLeft < 300) return 'text-[var(--sat-amber)]'
    return 'text-[var(--sat-text)]'
  }

  return (
    <header 
      className="bg-white text-gray-800 p-2 flex justify-between items-center border-b border-gray-300 relative z-20 select-none"
      style={{ 
          borderBottom: '2px dashed', 
          borderImage: 'repeating-linear-gradient(to right, rgb(167, 56, 87) 0%, rgb(167, 56, 87) 3.5%, transparent 3.5%, transparent 4%, rgb(249, 223, 205) 4%, rgb(249, 223, 205) 7.5%, transparent 7.5%, transparent 8%, rgb(28, 17, 103) 8%, rgb(28, 17, 103) 11.5%, transparent 11.5%, transparent 12%, rgb(94, 147, 101) 12%, rgb(94, 147, 101) 15.5%, transparent 15.5%, transparent 16%) 1 / 1 / 0 stretch',
          height: '70px',
          fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
      }}
    >
      {/* Left: Section Title & Directions */}
      <div className="pl-4 flex items-center gap-3">
          <div className="hidden sm:block bg-[#0f172a] p-1.5 rounded-lg">
             <Logo className="h-6 w-auto" />
          </div>
          <div>
            <p className="font-semibold text-lg leading-tight">{title}</p>
            <button className="text-sm text-blue-600 hover:underline">Directions</button>
          </div>
      </div>

      {/* Center: Timer */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          {!isTimerHidden && (
              <div className="text-xl font-bold text-black tabular-nums">
                  {formatTime(timeLeft)}
              </div>
          )}
          <button 
              onClick={() => setIsTimerHidden(!isTimerHidden)}
              className="flex items-center justify-center text-xs text-gray-600 hover:text-blue-600 focus:outline-none rounded-md p-1 transition-colors duration-200" 
              aria-label={isTimerHidden ? "Show timer" : "Hide timer"}
              title={isTimerHidden ? "Show timer" : "Hide timer"}
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
          </button>
      </div>

      {/* Right: Tools */}
      <div className="flex items-center gap-4 pr-4">
          {!showMathTools && (
              <button 
                  onClick={onAnnotateClick}
                  className={`flex flex-col items-center justify-center text-xs focus:outline-none rounded-md px-2 py-1 transition-colors duration-200 ${isAnnotateActive ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-200' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`} 
                  aria-label="Annotate"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Annotate
              </button>
          )}

          {showMathTools && (
              <>
                <button 
                    onClick={onCalculatorClick}
                    className="flex flex-col items-center justify-center text-xs focus:outline-none rounded-md px-2 py-1 transition-colors duration-200 text-gray-700 hover:text-blue-600 hover:bg-gray-100" 
                    aria-label="Calculator"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 mb-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"></path>
                    </svg>
                    Calculator
                </button>
                
                <button 
                    onClick={onReferenceClick}
                    className="flex flex-col items-center justify-center text-xs focus:outline-none rounded-md px-2 py-1 transition-colors duration-200 text-gray-700 hover:text-blue-600 hover:bg-gray-100" 
                    aria-label="Reference"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 mb-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"></path>
                    </svg>
                    Reference
                </button>
              </>
          )}

          <div className="relative">
              <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="flex flex-col items-center justify-center text-xs text-gray-700 hover:text-blue-600 focus:outline-none px-2 py-1" 
                  aria-label="More options"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                  More
              </button>
              {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                      {!showMathTools && (
                          <>
                            <button onClick={onAnnotateClick} className={`block w-full text-left px-4 py-2 text-sm ${isAnnotateActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {isAnnotateActive ? 'Stop Highlighting' : 'Start Highlighting'}
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                      )}
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Help</button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Shortcuts</button>
                  </div>
              )}
          </div>
      </div>
    </header>
  )
}