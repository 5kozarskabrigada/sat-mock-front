import React from 'react'

export default function Logo({ className = "h-8" }: { className?: string }) {
  // Extract custom classes to merge
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 ${className}`}>
        <img 
            src="https://image2url.com/r2/default/images/1770968120228-c4943beb-29ce-40ef-a184-1e6904058998.jpg" 
            alt="ExamRoom Logo"
            className="w-full h-full object-cover"
        />
    </div>
  )
}
