
'use client'

export default function ReferenceSheetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* We don't use a backdrop for non-modal behavior if desired, but typically cheat sheet is a modal. 
          User said "make the cheatsheet better", likely meaning draggable/non-blocking or better styled.
          If they want it to not hide UI, it should be draggable like calculator.
      */}
      <div className="bg-white w-[800px] h-[600px] overflow-y-auto rounded shadow-2xl border border-gray-300 pointer-events-auto flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
             <h2 className="font-bold text-lg font-serif">Reference Sheet</h2>
             <button onClick={onClose} className="text-gray-500 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1">
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
    </div>
  )
}
