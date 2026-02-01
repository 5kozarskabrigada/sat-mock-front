
'use client'

import { useEffect, useRef, useState } from 'react'
import FloatingWindow from '@/components/ui/floating-window'

export default function CalculatorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calculatorRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const initCalculator = () => {
        if (!containerRef.current) return
        
        // Clear container
        containerRef.current.innerHTML = ''
        
        const elt = document.createElement('div')
        elt.style.width = '100%'
        elt.style.height = '100%'
        containerRef.current.appendChild(elt)
        
        try {
          const calculator = (window as any).Desmos.GraphingCalculator(elt, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            expressionsCollapsed: false,
            autosize: true
          })
          calculatorRef.current = calculator
          setIsLoading(false)
        } catch (err) {
          console.error("Desmos init error:", err)
          setError("Failed to initialize calculator")
          setIsLoading(false)
        }
      }

      if ((window as any).Desmos) {
        initCalculator()
      } else {
        setIsLoading(true)
        // Check if script is already in document
        let script = document.querySelector('script[src*="desmos.com/api"]') as HTMLScriptElement
        
        if (!script) {
          script = document.createElement('script')
          script.src = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
          script.async = true
          document.body.appendChild(script)
        }

        const handleLoad = () => {
          initCalculator()
        }

        const handleError = () => {
          setError("Failed to load Desmos script")
          setIsLoading(false)
        }

        script.addEventListener('load', handleLoad)
        script.addEventListener('error', handleError)

        return () => {
          script.removeEventListener('load', handleLoad)
          script.removeEventListener('error', handleError)
        }
      }
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (calculatorRef.current) {
        try {
          calculatorRef.current.destroy()
        } catch (e) {}
      }
    }
  }, [])

  return (
    <FloatingWindow
      id="desmos_calculator"
      title="Graphing Calculator"
      isOpen={isOpen}
      onClose={onClose}
      minWidth={300}
      minHeight={200}
      defaultWidth={600}
      defaultHeight={500}
    >
        <div 
          ref={containerRef} 
          className="w-full h-full relative bg-white"
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-4 text-center">
                    <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-900 font-medium">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    </FloatingWindow>
  )
}
