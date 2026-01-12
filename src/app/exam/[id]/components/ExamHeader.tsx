
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
    <header 
      className="flex items-center justify-between px-6 bg-[var(--sat-panel)] border-b border-[var(--sat-border)] z-20 relative select-none"
      style={{ height: 'clamp(64px, 10vh, 80px)' }}
    >
      {/* Left: Logo + Section */}
      <div className="flex items-center space-x-4">
        {/* Placeholder Logo */}
        <div className="w-8 h-8 bg-[var(--sat-text)] rounded-sm flex items-center justify-center text-white font-bold text-xs">
          SAT
        </div>
        <div className="flex flex-col">
           <h1 className="font-semibold text-base text-[var(--sat-text)] leading-tight">{title}</h1>
           <button className="text-[var(--sat-primary)] text-xs hover:underline text-left mt-0.5">Directions ▼</button>
        </div>
      </div>

      {/* Center: Timer */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <div className="text-[11px] font-medium text-[var(--sat-muted)] uppercase tracking-wide mb-0.5">Time Remaining</div>
        <div className="flex items-center space-x-2">
            {!isTimerHidden && (
                <span className={`font-bold text-2xl tabular-nums ${getTimerColor()}`}>
                    {formatTime(timeLeft)}
                </span>
            )}
            <button 
                onClick={() => setIsTimerHidden(!isTimerHidden)}
                className="text-[var(--sat-muted)] hover:text-[var(--sat-text)] p-1 rounded hover:bg-[var(--sat-bg)] transition-colors"
                title={isTimerHidden ? "Show Timer" : "Hide Timer"}
            >
                {isTimerHidden ? (
                    <span className="text-xs font-medium border border-[var(--sat-border)] px-2 py-0.5 rounded bg-white">Show</span>
                ) : (
                    <span className="text-xs font-medium text-[var(--sat-muted)]">Hide</span>
                )}
            </button>
        </div>
      </div>

      {/* Right: Tools */}
      <div className="flex items-center space-x-2">
        {showMathTools && (
            <>
                <ToolButton 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008H10.5v-.008zm0 2.25h.008v.008H10.5v-.008zm0 2.25h.008v.008H10.5v-.008zm2.25-4.5h.008v.008H12.75v-.008zm0 2.25h.008v.008H12.75v-.008zm0 2.25h.008v.008H12.75v-.008zm2.25-4.5h.008v.008H15v-.008zm0 2.25h.008v.008H15v-.008zm0 2.25h.008v.008H15v-.008zM7.5 10.5h3v-3h-3v3zm5.25 0h3v-3h-3v3zM7.5 4.5h9a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 017.5 4.5z" />
                        </svg>
                    }
                    label="Calculator" 
                    onClick={onCalculatorClick} 
                />
                <ToolButton 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    }
                    label="Reference" 
                    onClick={onReferenceClick} 
                />
            </>
        )}
        
        <ToolButton 
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.425a1.875 1.875 0 01-2.652 0l-4.897-4.897a1.875 1.875 0 010-2.652l3.248-3.193" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
            }
            label="Annotate" 
            isActive={isAnnotateActive}
            onClick={onAnnotateClick} 
        />

        <div className="relative">
             <ToolButton 
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                }
                label="More" 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
            />
            {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Help</button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Shortcuts</button>
                </div>
            )}
        </div>
      </div>
    </header>
  )
}

function ToolButton({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick?: () => void, isActive?: boolean }) {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded transition-colors group ${isActive ? 'bg-[var(--sat-primary-weak)] text-[var(--sat-primary)]' : 'hover:bg-[var(--sat-bg)]'}`}
        >
            <div className={`mb-1 ${isActive ? 'text-[var(--sat-primary)]' : 'text-[var(--sat-text)] group-hover:text-black'}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--sat-primary)]' : 'text-[var(--sat-text)] group-hover:text-black'}`}>{label}</span>
        </button>
    )
}
