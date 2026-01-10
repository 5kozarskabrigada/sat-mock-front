
'use client'

import { useEffect, useRef } from 'react'

export default function CalculatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && containerRef.current && !(window as any).DesmosCalculator) {
      // Load Desmos script dynamically if not already loaded
      const script = document.createElement('script')
      script.src = 'https://www.desmos.com/api/v1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
      script.async = true
      script.onload = () => {
        if (containerRef.current) {
          const elt = document.createElement('div')
          elt.style.width = '100%'
          elt.style.height = '100%'
          containerRef.current.appendChild(elt)
          const calculator = (window as any).Desmos.GraphingCalculator(elt, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            expressionsCollapsed: false,
          })
          ;(window as any).DesmosCalculator = calculator
        }
      }
      document.body.appendChild(script)
    } else if (isOpen && containerRef.current && (window as any).DesmosCalculator) {
       // If re-opening, we might need to re-attach or it might just persist if we hid it
       // For simplicity in this mock, we just rely on CSS visibility or re-init if destroyed
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] h-[600px] flex flex-col pointer-events-auto resize overflow-hidden">
        {/* Title Bar */}
        <div className="h-10 bg-[#2f3136] flex items-center justify-between px-4 cursor-move">
            <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                <span className="text-white font-medium text-sm">Untitled Graph</span>
                <button className="px-3 py-0.5 bg-[#404247] text-white text-xs rounded hover:bg-[#505257]">Save</button>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        
        {/* Desmos Container */}
        <div ref={containerRef} className="flex-1 w-full h-full relative bg-white">
           {/* If API fails to load, show mock */}
           <div className="absolute inset-0 flex items-center justify-center text-gray-400 -z-10">
              Loading Calculator...
           </div>
        </div>
      </div>
    </div>
  )
}
