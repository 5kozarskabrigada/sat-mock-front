"use client"

import React, { useState } from 'react'

const PRIMARY_LOGO_URL = 'https://i.postimg.cc/zDw6fRmM/EXAMROOM.png'
const FALLBACK_LOGO_URL = '/images/submission-report-logo.png'

export default function Logo({ className = "h-8", withBorder = false }: { className?: string, withBorder?: boolean }) {
  const [logoSrc, setLogoSrc] = useState(PRIMARY_LOGO_URL)

  return (
    <div className={withBorder ? "bg-white p-3 rounded-lg border border-gray-200 shadow-sm" : ""}>
      <img 
        src={logoSrc}
        alt="ExamRoom Logo"
        className={`${className} object-contain`}
        style={{ aspectRatio: '4 / 1' }}
        onError={() => {
          if (logoSrc !== FALLBACK_LOGO_URL) {
            setLogoSrc(FALLBACK_LOGO_URL)
          }
        }}
      />
    </div>
  )
}
