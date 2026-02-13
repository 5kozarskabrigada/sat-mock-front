import React from 'react'

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <img 
      src="https://image2url.com/r2/default/images/1770968120228-c4943beb-29ce-40ef-a184-1e6904058998.jpg" 
      alt="ExamRoom Logo"
      className={className}
    />
  )
}
