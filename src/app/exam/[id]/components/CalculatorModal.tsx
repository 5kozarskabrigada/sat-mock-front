
'use client'

import { useEffect, useRef, useState } from 'react'

export default function CalculatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

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
            autosize: true
          })
          ;(window as any).DesmosCalculator = calculator
        }
      }
      document.body.appendChild(script)
    } else if (isOpen && (window as any).DesmosCalculator && containerRef.current) {
         // If re-opening, we might need to re-append the element if React unmounted the container
         // But Desmos instance might be tied to the old element. 
         // For stability, let's just clear and re-init if the container is empty
         if (containerRef.current.childElementCount === 0) {
            const elt = document.createElement('div')
            elt.style.width = '100%'
            elt.style.height = '100%'
            containerRef.current.appendChild(elt)
            // Destroy old instance to be safe
             if ((window as any).DesmosCalculator && typeof (window as any).DesmosCalculator.destroy === 'function') {
                 (window as any).DesmosCalculator.destroy();
             }
             const calculator = (window as any).Desmos.GraphingCalculator(elt, {
                keypad: true,
                expressions: true,
                settingsMenu: true,
                zoomButtons: true,
                expressionsCollapsed: false,
                autosize: true
              })
              ;(window as any).DesmosCalculator = calculator
         }
    }
  }, [isOpen])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            })
        }
    }
    const handleMouseUp = () => {
        setIsDragging(false)
    }

    if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div 
        className="absolute bg-white rounded-lg shadow-2xl w-[600px] h-[450px] flex flex-col pointer-events-auto overflow-hidden border border-gray-300"
        style={{ left: position.x, top: position.y }}
      >
        {/* Title Bar */}
        <div 
            className="h-8 bg-[#2f3136] flex items-center justify-between px-3 cursor-move select-none"
            onMouseDown={handleMouseDown}
        >
            <div className="flex items-center space-x-2">
                <span className="text-white font-medium text-xs">Desmos Graphing Calculator</span>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        
        {/* Desmos Container */}
        <div 
          ref={containerRef} 
          className="flex-1 w-full h-full relative bg-white"
          style={{ minHeight: '400px' }}
        ></div>
      </div>
    </div>
  )
}
