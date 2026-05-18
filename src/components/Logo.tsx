import React from 'react'

export default function Logo({ className = "h-8", withBorder = false }: { className?: string, withBorder?: boolean }) {
  return (
    <div className={withBorder ? "bg-white p-3 rounded-lg border border-gray-200 shadow-sm" : ""}>
      <img 
        src="https://image2url.com/r2/default/images/1772125793630-24416e69-e00e-4538-b1f3-b376f7fa528f.jpg"
        alt="ExamRoom Logo"
        className={`${className} object-cover`}
        style={{ aspectRatio: '4 / 1' }}
      />
    </div>
  )
}
