'use client'

import { useEffect } from 'react'

export default function BreakScreen({ 
  timeLeft, 
  onResume,
  isAdmin = false
}: { 
  timeLeft: number
  onResume: () => void 
  isAdmin?: boolean
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Escape key during break - use stopImmediatePropagation to prevent any browser defaults
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
      // Block F12 and other dev tools shortcuts
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }

    // Use capture: true to catch the event before it reaches other handlers
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1c] flex flex-col items-center justify-center text-white z-50">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-serif text-gray-200 tracking-wide">Take a moment to relax</h1>
        
        <div className="text-[120px] font-mono leading-none font-light tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="text-gray-400 text-lg animate-pulse">
            The exam will resume automatically when the timer expires.
        </div>

        {isAdmin && (
          <button 
            onClick={onResume}
            className="px-8 py-3 bg-[#1a2333] border border-gray-700 rounded-lg text-white hover:bg-[#253045] transition-colors text-lg"
          >
            Resume Exam (Admin)
          </button>
        )}
      </div>

      <div className="absolute bottom-12 text-center text-gray-500 text-sm max-w-md">
        Use this time to rest your eyes and mind. Do not close this window.
      </div>
    </div>
  )
}
