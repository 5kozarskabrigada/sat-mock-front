import React from 'react'

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <img 
      src="https://i.postimg.cc/4Y5V5pBq/logo.png"
      alt="ExamRoom Logo"
      className={`${className} object-contain`}
    />
  )
}
