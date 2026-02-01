'use client'

import React, { useState, useEffect, useRef } from 'react'

interface FloatingWindowProps {
  id: string
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  minWidth?: number
  minHeight?: number
  defaultWidth?: number
  defaultHeight?: number
}

export default function FloatingWindow({
  id,
  title,
  isOpen,
  onClose,
  children,
  minWidth = 300,
  minHeight = 200,
  defaultWidth = 500,
  defaultHeight = 400
}: FloatingWindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 })
  
  const windowRef = useRef<HTMLDivElement>(null)

  // Load position/size from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`floating_window_${id}`)
    if (saved) {
      try {
        const { p, s } = JSON.parse(saved)
        if (p) setPosition(p)
        if (s) setSize(s)
      } catch (e) {
        console.error("Failed to load window state", e)
      }
    }
  }, [id])

  // Save to localStorage
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(`floating_window_${id}`, JSON.stringify({ p: position, s: size }))
    }
  }, [id, position, size, isOpen])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let newX = e.clientX - dragStart.x
        let newY = e.clientY - dragStart.y
        
        // Boundary checks
        newX = Math.max(0, Math.min(window.innerWidth - size.width, newX))
        newY = Math.max(0, Math.min(window.innerHeight - size.height, newY))
        
        setPosition({ x: newX, y: newY })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        
        let newW = Math.max(minWidth, Math.min(window.innerWidth * 0.8, resizeStart.w + deltaX))
        let newH = Math.max(minHeight, Math.min(window.innerHeight * 0.8, resizeStart.h + deltaY))
        
        setSize({ width: newW, height: newH })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, resizeStart, size, minWidth, minHeight])

  if (!isOpen) return null

  return (
    <div
      ref={windowRef}
      className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="window-header flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 cursor-move select-none">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-0 relative">
        {children}
      </div>

      {/* Resize handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center group"
        onMouseDown={handleResizeStart}
      >
          <div className="w-2 h-2 border-r-2 border-b-2 border-gray-300 group-hover:border-indigo-500 transition-colors"></div>
      </div>
    </div>
  )
}
