import React from 'react'

export default function Logo({ className = "h-8", withBorder = false }: { className?: string, withBorder?: boolean }) {
  return (
    <div className={withBorder ? "bg-white p-3 rounded-lg border border-gray-200 shadow-sm" : ""}>
      <img 
        src="/images/logo.svg"
        alt="ExamRoom Logo"
        className={`${className} object-contain`}
        style={{ aspectRatio: '4 / 1' }}
      />
    </div>
  )
}
