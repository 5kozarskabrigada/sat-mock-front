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
            height: '70px', 
            padding: '8px',
            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
            borderBottom: '2px dashed',
            borderImage: 'repeating-linear-gradient(to right, rgb(167, 56, 87) 0%, rgb(167, 56, 87) 3.5%, rgba(0, 0, 0, 0) 3.5%, rgba(0, 0, 0, 0) 4%, rgb(249, 223, 205) 4%, rgb(249, 223, 205) 7.5%, rgba(0, 0, 0, 0) 7.5%, rgba(0, 0, 0, 0) 8%, rgb(28, 17, 103) 8%, rgb(28, 17, 103) 11.5%, rgba(0, 0, 0, 0) 11.5%, rgba(0, 0, 0, 0) 12%, rgb(94, 147, 101) 12%, rgb(94, 147, 101) 15.5%, rgba(0, 0, 0, 0) 15.5%, rgba(0, 0, 0, 0) 16%) 1 / 1 / 0 stretch'
        }}
      >
        {/* Left: Logo + Section */}
        <div className="flex flex-col justify-center h-full" style={{ paddingLeft: '16px', height: '52px' }}>
           <h1 className="font-bold block leading-tight" style={{ 
               fontSize: '18px', 
               fontWeight: 600, 
               color: 'oklch(0.278 0.033 256.848)', 
               lineHeight: '28px',
               fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
           }}>{title}</h1>
           <button className="hover:underline text-left" style={{
               color: 'oklch(0.546 0.245 262.881)',
               fontSize: '14px',
               fontWeight: 400,
               height: '20px',
               lineHeight: '20px',
               fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
           }}>Directions</button>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center top-6" style={{ top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="flex items-center justify-center space-x-2" style={{
              width: '83.2917px',
              height: '28px',
              gap: '8px'
          }}>
              {!isTimerHidden && (
                  <span className={`font-bold tabular-nums ${getTimerColor()}`} style={{ fontSize: '15px' }}>
                      {formatTime(timeLeft)}
                  </span>
              )}
              <button 
                  onClick={() => setIsTimerHidden(!isTimerHidden)}
                  className="hover:text-blue-600 transition-colors flex items-center justify-center"
                  title={isTimerHidden ? "Show Timer" : "Hide Timer"}
                  style={{
                      width: '24px',
                      height: '24px',
                      color: 'oklch(0.446 0.03 256.802)',
                      padding: '4px'
                  }}
                  >
                      {isTimerHidden ? (
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      )}
                  </button>
          </div>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-4">
          <button 
              onClick={onAnnotateClick}
              className={`flex flex-col items-center justify-center rounded-lg transition-colors
                  ${isAnnotateActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}
              `}
              style={{
                  width: '121.99px',
                  height: '48px',
                  color: 'oklch(0.373 0.034 259.733)'
              }}
          >
              <div className="mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <span className="text-[12px] font-medium">Highlights</span>
          </button>

          <div className="relative">
               <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
                  className="flex flex-col items-center justify-center hover:bg-gray-100 rounded-lg"
                  style={{
                      height: '40px',
                      color: 'oklch(0.373 0.034 259.733)'
                  }}
               >
                  <div className="mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </div>
                  <span className="text-[12px] font-medium">More</span>
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