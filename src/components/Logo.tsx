"use client"

import React from 'react'

const LOGO_URL = '/1/images/examroom-logo-wide.svg?v=20260526'

export default function Logo({ className = "h-8", withBorder = false }: { className?: string, withBorder?: boolean }) {
  return (
    <div className={withBorder ? "rounded-full border border-gray-300/70 shadow-sm overflow-hidden" : "rounded-full overflow-hidden"}>
      <img 
        src={LOGO_URL}
        alt="ExamRoom Logo"
        className={`${className} object-contain`}
        style={{ aspectRatio: '4 / 1', borderRadius: '9999px' }}
      />
    </div>
  )
}
