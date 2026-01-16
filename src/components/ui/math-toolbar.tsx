'use client'

import React, { useState } from 'react'

interface ToolbarButton {
  label: string
  latex: string
  keyCode?: string
}

interface ToolbarGroup {
  group: string
  items: ToolbarButton[]
}

const toolbarButtons: ToolbarGroup[] = [
  {
    group: 'Basic',
    items: [
      { label: '+', latex: '+', keyCode: 'plus' },
      { label: '−', latex: '-', keyCode: 'minus' },
      { label: '×', latex: '\\times', keyCode: 'times' },
      { label: '÷', latex: '\\div', keyCode: 'divide' },
      { label: '=', latex: '=', keyCode: 'equals' },
      { label: '±', latex: '\\pm' },
    ]
  },
  {
    group: 'Powers',
    items: [
      { label: 'x²', latex: '^{2}' },
      { label: 'xⁿ', latex: '^{}' },
      { label: '√', latex: '\\sqrt{}' },
      { label: '∛', latex: '\\sqrt[3]{}' },
    ]
  },
  {
    group: 'Fractions',
    items: [
      { label: 'a/b', latex: '\\frac{}{}' },
    ]
  },
  {
    group: 'Functions',
    items: [
      { label: 'sin', latex: '\\sin' },
      { label: 'cos', latex: '\\cos' },
      { label: 'tan', latex: '\\tan' },
      { label: 'log', latex: '\\log' },
      { label: 'ln', latex: '\\ln' },
    ]
  },
  {
    group: 'Greek',
    items: [
      { label: 'π', latex: '\\pi' },
      { label: 'θ', latex: '\\theta' },
      { label: 'α', latex: '\\alpha' },
      { label: 'β', latex: '\\beta' },
    ]
  },
  {
    group: 'Relations',
    items: [
      { label: '<', latex: '<' },
      { label: '>', latex: '>' },
      { label: '≤', latex: '\\le' },
      { label: '≥', latex: '\\ge' },
      { label: '≠', latex: '\\ne' },
      { label: '≈', latex: '\\approx' },
    ]
  }
]

interface MathToolbarProps {
  onInsert: (latex: string) => void
}

export default function MathToolbar({ onInsert }: MathToolbarProps) {
  const [activeGroup, setActiveGroup] = useState('Basic')

  return (
    <div className="border rounded-t-md bg-gray-50 border-gray-300">
      {/* Mobile Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-300 md:hidden">
        {toolbarButtons.map((group) => (
          <button
            key={group.group}
            type="button"
            onClick={() => setActiveGroup(group.group)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeGroup === group.group
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {group.group}
          </button>
        ))}
      </div>

      {/* Toolbar Buttons */}
      <div className="p-2">
        <div className="hidden md:flex flex-wrap gap-4 mb-2">
           {/* Desktop: Show all groups in a grid-like or grouped layout */}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {toolbarButtons.map((group) => (
            <div 
                key={group.group} 
                className={`flex flex-wrap gap-1 ${
                    // On mobile, only show active group. On desktop, show all with labels?
                    // Or just show all flat? Let's show labeled groups on desktop
                    'md:flex'
                } ${activeGroup === group.group ? 'flex' : 'hidden md:flex'}`}
            >
                <div className="hidden md:block w-full text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    {group.group}
                </div>
                {group.items.map((btn) => (
                    <button
                    key={btn.label}
                    type="button"
                    onClick={() => onInsert(btn.latex)}
                    className="px-2 py-1.5 min-w-[32px] text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors shadow-sm font-serif"
                    title={btn.label}
                    >
                    {btn.label}
                    </button>
                ))}
                <div className="hidden md:block w-px h-8 bg-gray-300 mx-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
