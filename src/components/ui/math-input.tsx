'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Dynamic import for react-mathquill to avoid SSR issues
const MathQuill = dynamic(
  async () => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        const jQuery = (await import('jquery')).default
        // @ts-ignore
        window.jQuery = jQuery
        // @ts-ignore
        window.$ = jQuery
      }
      
      // @ts-ignore
      const mod = await import('react-mathquill')
      if (mod.addStyles) {
        mod.addStyles()
      }
      return mod.default as any
    } catch (e) {
      console.error("Error loading react-mathquill", e)
      return () => <div>Error loading editor</div>
    }
  },
  { 
    ssr: false,
    loading: () => <div className="p-2 text-gray-400">Loading Math Editor...</div>
  }
) as React.ComponentType<any>

interface MathInputProps {
  value: string
  onChange: (latex: string) => void
  onInit?: (mathField: any) => void
  className?: string
}

export default function MathInput({ value, onChange, onInit, className }: MathInputProps) {
  return (
    <div className={`math-input-wrapper bg-white border border-gray-300 border-t-0 rounded-b-md p-3 min-h-[60px] flex items-center cursor-text focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${className}`}>
      <style jsx global>{`
        .mq-editable-field {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          width: 100%;
          font-family: var(--font-serif-family), serif;
          font-size: 1.125rem;
          color: #111827;
        }
        .mq-editable-field var {
            font-family: "Times New Roman", serif !important;
        }
        .mq-root-block {
          padding: 4px;
        }
        .mq-focused {
           box-shadow: none !important;
        }
      `}</style>
      <MathQuill
        latex={value}
        onChange={(mathField: any) => {
          onChange(mathField.latex())
        }}
        mathquillDidMount={(mathField: any) => {
          if (onInit) onInit(mathField)
        }}
        config={{
          spaceBehavesLikeTab: true,
          leftRightIntoCmdGoes: 'up',
          restrictMismatchedBrackets: true,
          sumStartsWithNEquals: true,
          supSubsRequireOperand: true,
          charsThatBreakOutOfSupSub: '+=<>',
          autoSubscriptNumerals: true,
          autoCommands: 'pi theta sqrt sum int alpha beta gamma infty approx le ge ne angle triangle parallel perp',
          autoOperatorNames: 'sin cos tan log ln',
        }}
      />
    </div>
  )
}
