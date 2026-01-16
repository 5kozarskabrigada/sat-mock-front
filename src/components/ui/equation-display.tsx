'use client'

import 'katex/dist/katex.min.css'
import { BlockMath, InlineMath } from 'react-katex'

interface EquationDisplayProps {
  latex: string
  block?: boolean
  className?: string
}

export default function EquationDisplay({ latex, block = true, className }: EquationDisplayProps) {
  if (!latex) return null

  return (
    <div className={`overflow-x-auto ${className}`}>
      {block ? (
        <BlockMath math={latex} />
      ) : (
        <InlineMath math={latex} />
      )}
    </div>
  )
}
