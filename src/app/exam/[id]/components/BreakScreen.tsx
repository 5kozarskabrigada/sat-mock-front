
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

        <button 
          onClick={onResume}
          className="px-8 py-3 bg-[#1a2333] border border-gray-700 rounded-lg text-white hover:bg-[#253045] transition-colors text-lg"
        >
          Resume Exam
        </button>

        {/* Music Widget Mock */}
        <div className="bg-black/40 rounded-full px-6 py-3 inline-flex items-center space-x-4 border border-gray-800">
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
            </button>
            <div className="text-left">
                <div className="text-sm font-medium text-white">Relaxing Music</div>
                <div className="text-xs text-gray-400">Lo-fi Chill</div>
            </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-center text-gray-500 text-sm max-w-md">
        You can resume the test at any point. Use this time to rest your eyes and mind.
      </div>
    </div>
  )
}
