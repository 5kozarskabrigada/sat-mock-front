
'use client'

export default function ReferenceSheetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-[800px] h-[600px] overflow-y-auto rounded shadow-2xl p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <h2 className="text-center font-bold text-xl mb-6 font-serif">Reference Sheet</h2>
        
        <div className="grid grid-cols-2 gap-8 font-serif">
            <div>
                <h3 className="font-bold border-b border-black mb-4 pb-1">Area and Volume</h3>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span>Area of a Circle</span>
                        <span className="font-mono">A = πr²</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Circumference</span>
                        <span className="font-mono">C = 2πr</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Rectangle Area</span>
                        <span className="font-mono">A = lw</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Triangle Area</span>
                        <span className="font-mono">A = ½bh</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="font-bold border-b border-black mb-4 pb-1">Special Right Triangles</h3>
                <div className="space-y-4 text-sm">
                     <p>x, x, x√2 (45°-45°-90°)</p>
                     <p>x, x√3, 2x (30°-60°-90°)</p>
                </div>
            </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500 font-sans">
            This reference sheet is provided for the math section.
        </div>
      </div>
    </div>
  )
}
