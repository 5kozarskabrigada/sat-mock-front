
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
        className="flex items-center justify-between px-6 bg-white z-20 relative select-none"
        style={{ 
            height: '69.4676px', 
            padding: '8px',
            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
            borderBottom: '2px dashed',
            borderImage: 'repeating-linear-gradient(to right, rgb(167, 56, 87) 0%, rgb(167, 56, 87) 3.5%, rgba(0, 0, 0, 0) 3.5%, rgba(0, 0, 0, 0) 4%, rgb(249, 223, 205) 4%, rgb(249, 223, 205) 7.5%, rgba(0, 0, 0, 0) 7.5%, rgba(0, 0, 0, 0) 8%, rgb(28, 17, 103) 8%, rgb(28, 17, 103) 11.5%, rgba(0, 0, 0, 0) 11.5%, rgba(0, 0, 0, 0) 12%, rgb(94, 147, 101) 12%, rgb(94, 147, 101) 15.5%, rgba(0, 0, 0, 0) 15.5%, rgba(0, 0, 0, 0) 16%) 1 / 1 / 0 stretch'
        }}
      >
        {/* Left: Logo + Section */}
        <div className="flex flex-col justify-center h-full">
           <h1 className="font-bold block leading-tight" style={{ 
               fontSize: '14px', 
               fontWeight: 600, 
               color: 'oklch(0.278 0.033 256.848)', 
               lineHeight: '28px',
               fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
           }}>{title}</h1>
           <button className="hover:underline text-left mt-0.5" style={{
               color: 'oklch(0.546 0.245 262.881)',
               fontSize: '12px',
               fontWeight: 400,
               height: '20px',
               lineHeight: '20px',
               fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
           }}>Directions</button>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center top-6">
          <div className="flex items-center space-x-2">
              {!isTimerHidden && (
                  <span className={`font-bold text-lg tabular-nums mr-2 ${getTimerColor()}`}>
                      {formatTime(timeLeft)}
                  </span>
              )}
              <button 
                  onClick={() => setIsTimerHidden(!isTimerHidden)}
                  className="text-black hover:text-gray-700 transition-colors flex items-center justify-center"
                  title={isTimerHidden ? "Show Timer" : "Hide Timer"}
                  style={{
                      width: '23.9815px',
                      height: '23.9815px',
                      color: 'oklch(0.446 0.03 256.802)',
                      padding: '4px'
                  }}
                  >
                      {isTimerHidden ? (
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                             <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                             <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                           </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                            <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                            <path d="M6.75 12c0-.619.107-1.215.304-1.772L5.23 8.408a11.27 11.27 0 00-2.65 3.149 1.762 1.762 0 000 1.113c1.487 4.471 5.705 7.697 10.677 7.697 1.49 0 2.918-.286 4.245-.815l-1.826-1.825a5.253 5.253 0 01-2.926.39v-.006a3.752 3.752 0 01-5.996-5.111z" />
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
      

    </>
  )
}
