import React from 'react'

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 400 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="ExamRoom Logo"
    >
      {/* Background for "ExamRoom" text - using a dark blue similar to the screenshot provided earlier */}
      {/* Text "EXAM" */}
      <text x="10" y="55" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="50" fill="#ffffff" letterSpacing="-2">EXAMR</text>
      
      {/* Clock Icon representing the first 'O' */}
      <circle cx="238" cy="40" r="22" fill="white" />
      <circle cx="238" cy="40" r="20" fill="white" stroke="#0f172a" strokeWidth="2" />
      
      {/* Clock ticks/hands */}
      {/* 12, 3, 6, 9 markers */}
      <line x1="238" y1="24" x2="238" y2="28" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <line x1="238" y1="52" x2="238" y2="56" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <line x1="222" y1="40" x2="226" y2="40" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <line x1="250" y1="40" x2="254" y2="40" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      
      {/* Hands showing roughly 10:10 or checkmark-ish */}
      <path d="M238 40 L228 32" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <path d="M238 40 L250 30" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      
      {/* Text "OM" */}
      <text x="268" y="55" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="50" fill="#ffffff" letterSpacing="-2">OM</text>
    </svg>
  )
}
