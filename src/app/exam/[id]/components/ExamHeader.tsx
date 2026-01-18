
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
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <div 
        className="h-[4px] w-full"
        style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #0077c8, #0077c8 8px, transparent 8px, transparent 10px, #00a651 10px, #00a651 18px, transparent 18px, transparent 20px, #ed1c24 20px, #ed1c24 28px, transparent 28px, transparent 30px, #662d91 30px, #662d91 38px, transparent 38px, transparent 40px)'
        }}
      ></div>
    </>
  )
}
