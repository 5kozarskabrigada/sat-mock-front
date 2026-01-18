
'use client'

import { useState } from 'react'

export default function ExamHeader({ 
  title, 
  timeLeft, 
  onReviewClick, 
  showMathTools,
  onCalculatorClick,
  onReferenceClick,
  isAnnotateActive,
  onAnnotateClick
}: { 
  title: string
  timeLeft: number
  onReviewClick: () => void
  showMathTools?: boolean
  onCalculatorClick?: () => void
  onReferenceClick?: () => void
  isAnnotateActive?: boolean
  onAnnotateClick?: () => void
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
    <>
      <header 
        className="flex items-center justify-between px-6 bg-white z-20 relative select-none border-b border-gray-100"
        style={{ height: '72px' }}
      >
        {/* Left: Logo + Section */}
        <div className="flex flex-col justify-center h-full">
           <h1 className="font-bold text-xl text-black font-serif leading-tight">{title}</h1>
           <button className="text-blue-600 text-sm hover:underline text-left mt-0.5">Directions</button>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center top-6">
          <div className="flex items-center space-x-2">
              {!isTimerHidden && (
                  <span className="font-bold text-lg tabular-nums text-black">
                      {formatTime(timeLeft)}
                  </span>
              )}
              <button 
                  onClick={() => setIsTimerHidden(!isTimerHidden)}
                  className="text-gray-500 hover:text-black transition-colors ml-1"
                  title={isTimerHidden ? "Show Timer" : "Hide Timer"}
              >
                  {isTimerHidden ? (
                      <span className="text-xs font-medium border border-gray-300 px-2 py-0.5 rounded bg-white">Show</span>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                  )}
              </button>
          </div>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-4">
          <button 
              onClick={onAnnotateClick}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors
                  ${isAnnotateActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
              `}
          >
              <div className="mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.425a1.875 1.875 0 01-2.652 0l-4.897-4.897a1.875 1.875 0 010-2.652l3.248-3.193" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
              </div>
              <span className="text-xs font-medium">Highlights</span>
          </button>

          <div className="relative">
               <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
                  className="flex flex-col items-center justify-center w-12 h-14 text-gray-600 hover:bg-gray-50 rounded-lg"
               >
                  <div className="mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                  </div>
                  <span className="text-xs font-medium">More</span>
              </button>
              {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                      {showMathTools && (
                        <>
                           <button onClick={onCalculatorClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Calculator</button>
                           <button onClick={onReferenceClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Reference Sheet</button>
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
      
      {/* Dashed Line Decoration */}
      <div className="h-[3px] w-full flex">
          {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="flex-1 h-full flex">
                  <div className="h-full w-1/4 bg-[#0077c8]"></div>
                  <div className="h-full w-1/4 bg-[#00a651]"></div>
                  <div className="h-full w-1/4 bg-[#ed1c24]"></div>
                  <div className="h-full w-1/4 bg-[#662d91]"></div>
              </div>
          ))}
      </div>
    </>
  )
}
