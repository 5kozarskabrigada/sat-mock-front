'use client'

export default function BreakScreen({ 
  timeLeft, 
  onResume 
}: { 
  timeLeft: number
  onResume: () => void 
}) {
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
      </div>

      <div className="absolute bottom-12 text-center text-gray-500 text-sm max-w-md">
        Use this time to rest your eyes and mind. Do not close this window.
      </div>
    </div>
  )
}
