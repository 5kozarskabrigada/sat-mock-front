
'use client'

import { useState, useEffect, useRef } from 'react'

export default function QuestionViewer({ 
  question, 
  questionIndex, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerChange,
  isMathSection,
  isMarked,
  onToggleMark
}: { 
  question: any
  questionIndex: number
  totalQuestions: number
  selectedAnswer: any
  onAnswerChange: (val: any) => void
  isMathSection?: boolean
  isMarked: boolean
  onToggleMark: () => void
}) {
  const isMultipleChoice = question.content.options && question.content.options.A
  const [inputValue, setInputValue] = useState(selectedAnswer || '')
  const [crossedAnswers, setCrossedAnswers] = useState<Record<string, boolean>>({})
  const [isAbcMode, setIsAbcMode] = useState(false)
  
  // Resizable pane state
  const [leftPaneWidth, setLeftPaneWidth] = useState(50) // percentage
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Annotation State
  const passageRef = useRef<HTMLDivElement>(null)
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, show: boolean, highlightId?: string } | null>(null)

  // Reset local state when question changes
  useEffect(() => {
    setCrossedAnswers({})
    setInputValue(selectedAnswer || '')
    setSelectionMenu(null)
    setIsAbcMode(false)
  }, [question.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onAnswerChange(e.target.value)
  }

  const toggleCrossOutDirect = (key: string) => {
    setCrossedAnswers(prev => ({
        ...prev,
        [key]: !prev[key]
    }))
  }

  // Handle Drag for Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Clamp between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftPaneWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = 'default'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const startResize = () => {
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
  }

  // Annotation: Handle Text Selection & Click on Highlights
  useEffect(() => {
    const handleSelection = () => {
        const selection = window.getSelection()
        
        // Check if we selected text
        if (selection && selection.toString().trim().length > 0 && passageRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            
            setSelectionMenu({
                x: rect.left + (rect.width / 2),
                y: rect.top - 10,
                show: true
            })
            return
        } 
    }
    
    // Handle click on existing highlight
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.classList.contains('annotation-highlight')) {
            const rect = target.getBoundingClientRect()
            setSelectionMenu({
                x: rect.left + (rect.width / 2),
                y: rect.top - 10,
                show: true,
                highlightId: target.id // Assuming we might identify by ID or just use the target reference if we had complex logic
            })
            
            // Select the text of the highlight so that applyHighlight/removeHighlight works
            const range = document.createRange()
            range.selectNodeContents(target)
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)
        }
    }

    const handleMouseUp = () => {
        setTimeout(handleSelection, 10)
    }

    const el = passageRef.current
    if (el) {
        el.addEventListener('mouseup', handleMouseUp)
        el.addEventListener('click', handleClick)
    }

    return () => {
        if (el) {
            el.removeEventListener('mouseup', handleMouseUp)
            el.removeEventListener('click', handleClick)
        }
    }
  }, [])

  // Clear menu on global click if not clicking menu
  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest('.annotation-menu')) return
          // If clicking highlight, don't clear (handled by handleClick)
          if ((e.target as HTMLElement).classList.contains('annotation-highlight')) return
          
          if (window.getSelection()?.toString().length === 0) {
              setSelectionMenu(null)
          }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyHighlight = (color: string) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      // Check if we are already inside a highlight
      let node = selection.anchorNode
      // Climb up to find span.annotation-highlight
      while (node && node !== passageRef.current) {
          if (node.nodeType === 1 && (node as Element).classList.contains('annotation-highlight')) {
               // We found an existing highlight. Change its color.
               const el = node as HTMLElement
               el.className = `annotation-highlight border-b-2 border-${color}-500 cursor-pointer`
               el.dataset.color = color
               // Apply specific styles
               el.style.backgroundColor = '' // Reset
               el.style.borderBottomColor = ''
               
               if (color === 'yellow') el.style.backgroundColor = 'rgba(254, 240, 138, 0.2)'
               if (color === 'blue') el.style.backgroundColor = 'rgba(186, 230, 253, 0.2)'
               if (color === 'pink') el.style.backgroundColor = 'rgba(251, 207, 232, 0.2)'
               
               el.style.borderBottomWidth = '1px'
               el.style.borderBottomStyle = 'solid'
               if (color === 'yellow') el.style.borderBottomColor = '#eab308'
               if (color === 'blue') el.style.borderBottomColor = '#3b82f6'
               if (color === 'pink') el.style.borderBottomColor = '#ec4899'
               
               setSelectionMenu(null)
               window.getSelection()?.removeAllRanges()
               return
          }
          node = node.parentNode
      }

      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.className = `annotation-highlight border-b-2 border-${color}-500 cursor-pointer`
      // Store color data if needed
      span.dataset.color = color
      
      // Minimal background tint if desired, but user said "lines... make it much thinner"
      // So maybe just underline? Or very light bg?
      // "lines used for coloring make it much thinner" -> likely refers to underline.
      // I will stick to border-bottom and maybe no background or very light.
      if (color === 'yellow') span.style.backgroundColor = 'rgba(254, 240, 138, 0.2)'
      if (color === 'blue') span.style.backgroundColor = 'rgba(186, 230, 253, 0.2)'
      if (color === 'pink') span.style.backgroundColor = 'rgba(251, 207, 232, 0.2)'
      
      // Thin line
      span.style.borderBottomWidth = '1px'
      span.style.borderBottomStyle = 'solid'
      if (color === 'yellow') span.style.borderBottomColor = '#eab308'
      if (color === 'blue') span.style.borderBottomColor = '#3b82f6'
      if (color === 'pink') span.style.borderBottomColor = '#ec4899'

      try {
        range.surroundContents(span)
        selection.removeAllRanges()
        setSelectionMenu(null)
      } catch (e) {
          console.error("Cannot highlight across elements", e)
      }
  }

  const removeHighlight = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      let node = selection.anchorNode
      while (node && node !== passageRef.current) {
          if (node.nodeType === 1 && (node as Element).classList.contains('annotation-highlight')) {
               const el = node as HTMLElement
               const parent = el.parentNode
               if (parent) {
                   // Unwrap
                   while (el.firstChild) parent.insertBefore(el.firstChild, el)
                   parent.removeChild(el)
               }
               setSelectionMenu(null)
               window.getSelection()?.removeAllRanges()
               return
          }
          node = node.parentNode
      }
  }

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
      {/* Decorative dashed line top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10 flex">
        {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`flex-1 h-full ${['bg-blue-800', 'bg-green-700', 'bg-red-700', 'bg-yellow-600'][i % 4]} mr-1 rounded-full opacity-80`}></div>
        ))}
      </div>

      {/* Floating Annotation Menu */}
      {selectionMenu && selectionMenu.show && (
          <div 
            className="fixed z-50 flex items-center bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 space-x-1 annotation-menu transform -translate-x-1/2 -translate-y-full"
            style={{ left: selectionMenu.x, top: selectionMenu.y - 10 }}
          >
              <button onClick={() => applyHighlight('yellow')} className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('blue')} className="w-6 h-6 bg-blue-100 border border-blue-300 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('pink')} className="w-6 h-6 bg-pink-100 border border-pink-300 rounded hover:scale-110 transition-transform" />
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button onClick={removeHighlight} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded" title="Remove Highlight">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
              </button>
          </div>
      )}

      {/* Left Pane: Passage / Instructions */}
      <div 
        className="h-full overflow-y-auto border-r border-gray-300 bg-white p-10 pt-12 pb-20 font-serif text-lg leading-relaxed text-black" 
        style={{ width: `${leftPaneWidth}%` }}
        ref={passageRef}
      >
        {/* Removed Header per request */}
        
        {question.content.passage ? (
            <p className="whitespace-pre-wrap">{question.content.passage}</p>
        ) : isMathSection ? (
            <div>
                <h4 className="font-bold mb-4 text-black">Student-Produced Response Directions</h4>
                <ul className="list-disc pl-5 space-y-2 text-base text-black">
                    <li>If you find more than one correct answer, enter only one answer.</li>
                    <li>You can enter up to 5 characters for a positive answer and up to 6 characters (including the negative sign) for a negative answer.</li>
                    <li>If your answer is a fraction that doesn’t fit in the provided space, enter the decimal equivalent.</li>
                    <li>If your answer is a decimal that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li>
                    <li>If your answer is a mixed number (such as 3½), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li>
                    <li>Don’t enter symbols such as a percent sign, comma, or dollar sign.</li>
                </ul>
                <h5 className="font-bold mt-6 mb-2 text-black">Examples</h5>
                <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="border border-gray-300 p-2 text-left font-bold text-black">Answer</th>
                            <th className="border border-gray-300 p-2 text-left font-bold text-black">Acceptable ways to enter answer</th>
                            <th className="border border-gray-300 p-2 text-left font-bold text-black">Unacceptable: will NOT receive credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 p-2 text-black">3.5</td>
                            <td className="border border-gray-300 p-2 text-black">3.5, 3.50, 7/2</td>
                            <td className="border border-gray-300 p-2 text-black">3 1/2, 31/2</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 p-2 text-black">2/3</td>
                            <td className="border border-gray-300 p-2 text-black">2/3, .6666, .6667, 0.666, 0.667</td>
                            <td className="border border-gray-300 p-2 text-black">0.66, .66, 0.67, .67</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 p-2 text-black">-1/3</td>
                            <td className="border border-gray-300 p-2 text-black">-1/3, -.3333, -0.333</td>
                            <td className="border border-gray-300 p-2 text-black">-.33, -0.33</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-gray-500 italic">[No passage provided for this question]</p>
        )}
      </div>

      {/* Resizer Handle */}
      <div
        className="w-4 hover:bg-blue-100 cursor-col-resize z-30 transition-colors relative group flex items-center justify-center -ml-2"
        onMouseDown={startResize}
      >
         <div className="w-1 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors" />
      </div>

      {/* Right Pane: Question */}
      <div className="h-full overflow-y-auto bg-gray-50 p-10 pt-12 pb-20 relative" style={{ width: `${100 - leftPaneWidth}%` }}>
        {/* Question Header Bar */}
        <div className="bg-[#eef0f2] border-b border-gray-300 flex items-center justify-between px-4 py-3 mb-6 rounded-t-md">
            <div className="flex items-center space-x-3">
                <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-sm shadow-sm font-sans">
                    {questionIndex + 1}
                </div>
                <button 
                    onClick={onToggleMark}
                    className="flex items-center space-x-2 text-gray-600 hover:text-black group"
                >
                    {isMarked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                           <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-black">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                    )}
                    <span className={`font-sans font-medium text-sm ${isMarked ? 'text-red-600' : ''}`}>Mark for Review</span>
                </button>
            </div>
            
            <div className="text-gray-400">
                <button 
                    onClick={() => setIsAbcMode(!isAbcMode)}
                    className={`rounded px-2 py-1 text-xs font-bold shadow-sm transition-colors
                        ${isAbcMode ? 'bg-blue-700 text-white' : 'bg-white text-gray-500 border border-gray-300'}
                    `}
                >
                    ABC
                </button>
            </div>
        </div>

        {/* Question Text */}
        <div className="mb-8 font-serif text-xl leading-relaxed text-black">
            {question.content.question}
        </div>

        {/* Answer Area */}
        <div className="space-y-4">
            {isMultipleChoice ? (
                Object.entries(question.content.options).map(([key, value]) => {
                    if (!value) return null
                    const isSelected = selectedAnswer === key
                    const isCrossed = crossedAnswers[key]
                    
                    return (
                        <div key={key} className="relative group flex items-center">
                            <button
                                onClick={() => !isCrossed && onAnswerChange(key)}
                                disabled={isCrossed}
                                className={`flex-1 text-left p-4 rounded-xl border-2 transition-all flex items-center relative
                                    ${isSelected 
                                        ? 'border-blue-700 bg-white shadow-md ring-1 ring-blue-700' 
                                        : isCrossed
                                            ? 'border-gray-200 bg-white opacity-60' // Dimmed whole button
                                            : 'border-black bg-white hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div 
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center mr-4 font-sans font-bold text-sm flex-shrink-0 z-30
                                        ${isSelected 
                                            ? 'bg-blue-700 text-white' 
                                            : isCrossed
                                                ? 'bg-white border border-gray-300 text-gray-400'
                                                : 'bg-white border border-black text-black'
                                        }
                                    `}
                                >
                                    {key}
                                </div>
                                <span className={`font-serif text-lg ${isCrossed ? 'text-gray-400 line-through' : 'text-black'}`}>
                                    {value as string}
                                </span>
                            </button>

                            {/* Right-side Action Icon (Strikethrough) OR Undo */}
                            {isAbcMode && (
                                <button 
                                    onClick={() => toggleCrossOutDirect(key)}
                                    className={`ml-3 w-8 h-8 rounded-full border flex items-center justify-center transition-colors
                                        ${isCrossed 
                                            ? 'border-transparent text-blue-600 hover:underline text-xs font-bold' // Undo Style
                                            : 'border-black text-black hover:bg-gray-100' // Cross out style
                                        }
                                    `}
                                    title={isCrossed ? "Undo strikethrough" : "Cross out answer"}
                                >
                                    {isCrossed ? (
                                        "Undo"
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{key}</span>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-full h-0.5 bg-current transform -rotate-45"></div>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            )}
                        </div>
                    )
                })
            ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                    <label className="block text-sm font-medium text-gray-500 mb-2 font-sans">
                        Enter your answer (e.g., 5.566, -5.566, 2/3, -2/3)
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-gray-300 rounded-md font-serif text-xl focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400"
                        placeholder="Answer"
                    />
                </div>
            )}
        </div>
      </div>
      
       {/* Decorative dashed line bottom */}
       <div className="absolute bottom-0 left-0 right-0 h-1 z-10 flex">
        {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`flex-1 h-full ${['bg-blue-800', 'bg-green-700', 'bg-red-700', 'bg-yellow-600'][i % 4]} mr-1 rounded-full opacity-80`}></div>
        ))}
      </div>
    </div>
  )
}
