'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import parse from 'html-react-parser'

const decodeHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    try {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    } catch (e) {
        return html;
    }
}

const Latex = ({ children, className, forceInline }: { children: string, className?: string, forceInline?: boolean }) => {
    if (!children) return null;
    
    // Attempt to decode if it looks like escaped HTML
    let content = children;
    if (content.includes('&lt;') || content.includes('&gt;')) {
        content = decodeHtml(content);
    }

    const options = {
        replace: (domNode: any) => {
            if (domNode.type === 'text') {
                const text = domNode.data
                // Removed $$ delimiter to prevent unintended rendering
                const regex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g
                const parts = text.split(regex)
                
                if (parts.length > 1) {
                    return (
                        <>
                            {parts.map((part: string, index: number) => {
                                if (part.startsWith('\\[') && part.endsWith('\\]')) {
                                    return forceInline ? <InlineMath key={index} math={part.slice(2, -2)} /> : <BlockMath key={index} math={part.slice(2, -2)} />
                                } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                                    return <InlineMath key={index} math={part.slice(2, -2)} />
                                } else {
                                    return <span key={index}>{part}</span>
                                }
                            })}
                        </>
                    )
                }
            }

            if (domNode.type === 'tag' && domNode.name === 'math-component') {
                const latex = domNode.attribs?.latex
                const display = domNode.attribs?.display
                if (latex) {
                    if (display === 'block' && !forceInline) {
                        return <BlockMath math={latex} />
                    }
                    return <InlineMath math={latex} />
                }
            }
        }
    }

    return (
        <span className={`latex-content ${className || ''}`}>
            {parse(content, options)}
        </span>
    );
};

export default function QuestionViewer({ 
  question, 
  questionIndex, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerChange,
  isMathSection,
  isMarked,
  onToggleMark,
  isAnnotateActive,
  highlights = [],
  onHighlightsChange
}: { 
  question: any
  questionIndex: number
  totalQuestions: number
  selectedAnswer: any
  onAnswerChange: (val: any) => void
  isMathSection?: boolean
  isMarked: boolean
  onToggleMark: () => void
  isAnnotateActive: boolean
  highlights?: any[]
  onHighlightsChange?: (highlights: any[]) => void
}) {
  const isMultipleChoice = question.content.options && question.content.options.A
  const [inputValue, setInputValue] = useState(selectedAnswer || '')
  const [crossedAnswers, setCrossedAnswers] = useState<Record<string, boolean>>({})
  const [isAbcMode, setIsAbcMode] = useState(false)
  
  // Annotation State
  const passageRef = useRef<HTMLDivElement>(null)
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, show: boolean, highlightId?: string } | null>(null)
  
  // Memoize passage content to show it instantly
  const passageHTML = useMemo(() => {
    return (highlights && highlights.length > 0 && typeof highlights[0] === 'string' && highlights[0].startsWith('<'))
        ? highlights[0]
        : question.content.passage 
            ? `<p class="whitespace-pre-wrap">${question.content.passage}</p>`
            : ''
  }, [question.id, highlights])

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
    // Cannot cross out if it's the selected answer
    if (selectedAnswer === key) return

    setCrossedAnswers(prev => ({
        ...prev,
        [key]: !prev[key]
    }))
  }

  // Annotation: Handle Text Selection & Click on Highlights
  useEffect(() => {
    const handleSelection = () => {
        if (!isAnnotateActive) return

        const selection = window.getSelection()
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
    
    const handleClick = (e: MouseEvent) => {
        if (!isAnnotateActive) return

        const target = e.target as HTMLElement
        if (target.classList.contains('annotation-highlight')) {
            const rect = target.getBoundingClientRect()
            setSelectionMenu({
                x: rect.left + (rect.width / 2),
                y: rect.top - 10,
                show: true,
                highlightId: target.id 
            })
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
  }, [isAnnotateActive])

  // Clear menu on global click or when annotation mode is disabled
  useEffect(() => {
      if (!isAnnotateActive) {
          setSelectionMenu(null)
          return
      }

      const handleClickOutside = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest('.annotation-menu')) return
          if ((e.target as HTMLElement).classList.contains('annotation-highlight')) return
          if (window.getSelection()?.toString().length === 0) {
              setSelectionMenu(null)
          }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAnnotateActive])

  const applyHighlight = (color: string) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      if (range.collapsed) return

      const span = document.createElement('span')
      span.className = `annotation-highlight border-b-2 cursor-pointer`
      span.dataset.color = color
      
      // Detailed styling based on color
      if (color === 'yellow') {
          span.style.backgroundColor = 'rgba(254, 240, 138, 0.6)'
          span.style.borderBottomColor = '#eab308'
      } else if (color === 'blue') {
          span.style.backgroundColor = 'rgba(186, 230, 253, 0.6)'
          span.style.borderBottomColor = '#3b82f6'
      } else if (color === 'pink') {
          span.style.backgroundColor = 'rgba(251, 207, 232, 0.6)'
          span.style.borderBottomColor = '#ec4899'
      } else if (color === 'underline') {
          span.style.backgroundColor = 'transparent'
          span.style.borderBottomColor = 'black'
          span.style.borderBottomWidth = '2px'
      }
      
      span.style.borderBottomStyle = 'solid'
      span.style.borderBottomWidth = color === 'underline' ? '2px' : '1px'

      try {
        // Robust range handling: If range spans multiple nodes, surroundContents fails.
        // We use a more manual approach if needed, but for simple passages surroundContents is okay.
        // If it fails, we'll log it.
        range.surroundContents(span)
        selection.removeAllRanges()
        setSelectionMenu(null)
        
        // Persist change
        if (onHighlightsChange && passageRef.current) {
            onHighlightsChange([passageRef.current.innerHTML])
        }
      } catch (e) {
          console.warn("Simple surround failed, trying complex wrap", e)
          // Fallback: extract contents and wrap
          try {
              const contents = range.extractContents()
              span.appendChild(contents)
              range.insertNode(span)
              selection.removeAllRanges()
              setSelectionMenu(null)
              if (onHighlightsChange && passageRef.current) {
                  onHighlightsChange([passageRef.current.innerHTML])
              }
          } catch (err) {
              console.error("Critical highlight error", err)
          }
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

  const [dividerPosition, setDividerPosition] = useState(50) // percentage
  const [isResizing, setIsResizing] = useState(false)

  // Load divider position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('math_divider_position')
    if (saved) setDividerPosition(Number(saved))
  }, [])

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newPos = (e.clientX / window.innerWidth) * 100
        const clampedPos = Math.max(20, Math.min(80, newPos))
        setDividerPosition(clampedPos)
      }
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        localStorage.setItem('math_divider_position', dividerPosition.toString())
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, dividerPosition])

  const hasPassage = !!question.content.passage && !isMathSection
  // Check for SPR (Student-Produced Response) in Math section (no multiple choice options)
  const isSPR = isMathSection && !isMultipleChoice
  // Check if there is an image in the question content
  const hasImage = !!question.content.image_url
  // Use two column layout ONLY if there is a passage OR if it's an SPR question (for directions)
  const twoColumnLayout = hasPassage || isSPR

  // ALWAYS show image in the question content (right side/main area)
  const showImageInContent = hasImage

  return (
    <div className="flex-1 flex overflow-hidden relative h-full bg-[var(--sat-bg)] select-none">
      {/* Floating Annotation Menu */}
      {selectionMenu && selectionMenu.show && (
          <div 
            className="fixed z-50 flex items-center bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 p-1.5 space-x-2 annotation-menu transform -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: selectionMenu.x, top: selectionMenu.y - 10 }}
          >
              <button 
                onClick={() => applyHighlight('yellow')} 
                className="w-8 h-8 bg-yellow-200 border-2 border-yellow-400 rounded-full hover:scale-110 transition-transform shadow-sm" 
                title="Highlight Yellow"
              />
              <button 
                onClick={() => applyHighlight('blue')} 
                className="w-8 h-8 bg-blue-200 border-2 border-blue-400 rounded-full hover:scale-110 transition-transform shadow-sm" 
                title="Highlight Blue"
              />
              <button 
                onClick={() => applyHighlight('pink')} 
                className="w-8 h-8 bg-pink-200 border-2 border-pink-400 rounded-full hover:scale-110 transition-transform shadow-sm" 
                title="Highlight Pink"
              />
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button 
                onClick={() => applyHighlight('underline')} 
                className="w-8 h-8 flex items-center justify-center border-2 border-gray-200 rounded-full hover:scale-110 transition-transform bg-white hover:border-black shadow-sm"
                title="Underline"
              >
                 <span className="border-b-2 border-black font-bold text-sm">U</span>
              </button>
              <button 
                onClick={removeHighlight} 
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 border-2 border-transparent rounded-full transition-all" 
                title="Delete Highlight"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.174-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
              </button>
          </div>
      )}

      {/* Main Layout */}
      {twoColumnLayout ? (
          <div className="flex w-full h-full p-4 gap-0 items-start relative">
              {/* Left Column */}
              <div 
                className="overflow-y-auto content-pane min-w-0"
                style={{ 
                    width: `${dividerPosition}%`, 
                    padding: '16px',
                    fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: 'oklch(0.145 0 0)',
                    borderRight: '1px solid #e5e7eb',
                    height: '100%'
                }}
              >
                 {isSPR ? (
                     <div className="prose max-w-none">
                        <h2 className="text-lg font-semibold mb-4">Student-Produced Response Directions</h2>
                        <ul className="list-disc pl-5 mb-4">
                            <li>If you find more than one correct answer, enter only one answer.</li>
                            <li>You can enter up to 5 characters for a positive answer and up to 6 characters (including the negative sign) for a negative answer.</li>
                            <li>If your answer is a fraction that doesn’t fit in the provided space, enter the decimal equivalent.</li>
                            <li>If your answer is a decimal that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li>
                            <li>If your answer is a mixed number (such as 3½), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li>
                            <li>Don’t enter symbols such as a percent sign, comma, or dollar sign.</li>
                        </ul>
                        <h3 className="text-md font-semibold mb-2">Examples</h3>
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Answer</th>
                                    <th className="border border-gray-300 p-2 text-left">Acceptable ways to enter answer</th>
                                    <th className="border border-gray-300 p-2 text-left">Unacceptable: will NOT receive credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-2">3.5</td>
                                    <td className="border border-gray-300 p-2">3.5<br/>3.50<br/>7/2</td>
                                    <td className="border border-gray-300 p-2">31/2<br/>3 1/2</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2">2/3</td>
                                    <td className="border border-gray-300 p-2">2/3<br/>.6666<br/>.6667<br/>0.666<br/>0.667</td>
                                    <td className="border border-gray-300 p-2">0.66<br/>.66<br/>0.67<br/>.67</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2">-1/3</td>
                                    <td className="border border-gray-300 p-2">-1/3<br/>-.3333<br/>-0.333</td>
                                    <td className="border border-gray-300 p-2">-.33<br/>-0.33</td>
                                </tr>
                            </tbody>
                        </table>
                     </div>
                 ) : question.content.passage ? (
                    <div className="prose max-w-none">
                        <div 
                            ref={passageRef}
                            className={`annotation-tool relative ${isAnnotateActive ? 'select-text cursor-crosshair' : ''}`}
                            dangerouslySetInnerHTML={{ __html: passageHTML }}
                        />
                    </div>
                 ) : null}
              </div>

              {/* Movable Divider */}
              <div 
                className={`w-1.5 h-full cursor-col-resize hover:bg-indigo-400 transition-colors z-10 ${isResizing ? 'bg-indigo-600' : 'bg-gray-200'}`}
                onMouseDown={handleDividerMouseDown}
              />

              {/* Right Column */}
              <div 
                className="overflow-y-auto flex flex-col content-pane min-w-0"
                style={{ 
                    width: `${100 - dividerPosition}%`, 
                    position: 'relative',
                    height: '100%'
                }}
              >
                 <div className={`mb-4 flex flex-col items-center w-full`}>
                    <div className="w-full max-w-[600px]">
                        <QuestionContent 
                            question={question}
                            questionIndex={questionIndex}
                            isMultipleChoice={isMultipleChoice}
                            selectedAnswer={selectedAnswer}
                            crossedAnswers={crossedAnswers}
                            isAbcMode={isAbcMode}
                            setIsAbcMode={setIsAbcMode}
                            onAnswerChange={onAnswerChange}
                            toggleCrossOutDirect={toggleCrossOutDirect}
                            inputValue={inputValue}
                            handleInputChange={handleInputChange}
                            isMarked={isMarked}
                            onToggleMark={onToggleMark}
                            showImage={showImageInContent}
                        />
                    </div>
                 </div>
              </div>
          </div>
      ) : (
          <div className="flex w-full h-full p-4 justify-center">
              {/* Full Width Question Panel */}
              <div className="overflow-y-auto p-4 flex flex-col w-full max-w-[1100px] items-center">
                 <div className="w-full max-w-[600px]">
                    <QuestionContent 
                        question={question}
                        questionIndex={questionIndex}
                        isMultipleChoice={isMultipleChoice}
                        selectedAnswer={selectedAnswer}
                        crossedAnswers={crossedAnswers}
                        isAbcMode={isAbcMode}
                        setIsAbcMode={setIsAbcMode}
                        onAnswerChange={onAnswerChange}
                        toggleCrossOutDirect={toggleCrossOutDirect}
                        inputValue={inputValue}
                        handleInputChange={handleInputChange}
                        isMarked={isMarked}
                        onToggleMark={onToggleMark}
                        showImage={showImageInContent}
                    />
                 </div>
              </div>
          </div>
      )}
    </div>
  )
}

function QuestionContent({
    question,
    questionIndex,
    isMultipleChoice,
    selectedAnswer,
    crossedAnswers,
    isAbcMode,
    setIsAbcMode,
    onAnswerChange,
    toggleCrossOutDirect,
    inputValue,
    handleInputChange,
    isMarked,
    onToggleMark,
    showImage
}: any) {
    return (
        <>
            {/* Header: Question Number + Tools */}
            <div className="question-index-container flex items-center justify-between bg-gray-200 rounded mb-2 top-0 z-5" 
                style={{
                    backgroundColor: 'rgb(240, 240, 240)',
                    height: '39.9884px',
                    marginBottom: '8px',
                    borderBottom: '2px dashed',
                    borderBottomColor: 'oklch(0.145 0 0)',
                    borderImage: 'repeating-linear-gradient(to right, rgb(167, 56, 87) 0%, rgb(167, 56, 87) 3.5%, transparent 3.5%, transparent 4%, rgb(249, 223, 205) 4%, rgb(249, 223, 205) 7.5%, transparent 7.5%, transparent 8%, rgb(28, 17, 103) 8%, rgb(28, 17, 103) 11.5%, transparent 11.5%, transparent 12%, rgb(94, 147, 101) 12%, rgb(94, 147, 101) 15.5%, transparent 15.5%, transparent 16%) 1 / 1 / 0 stretch'
                }}
            >
                <div className="flex items-center h-full">
                    <div className="question-index font-semibold bg-black text-white text-sm h-full flex items-center justify-center"
                        style={{
                            width: '32.8588px',
                            paddingLeft: '12.5px',
                            paddingRight: '12.5px',
                            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                            fontSize: '14px'
                        }}
                    >
                        {questionIndex + 1}
                    </div>
                    <button 
                        onClick={onToggleMark}
                        className="flex items-center text-sm text-gray-600 hover:text-black mr-2 h-full ml-3"
                    >
                        <svg fill={isMarked ? "currentColor" : "currentColor"} viewBox="0 0 24 24" className={`w-5 h-5 ${isMarked ? 'text-red-600' : 'text-gray-500'}`}>
                            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.807-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"></path>
                        </svg>
                        <span className="ml-1" style={{ fontFamily: '"Noto Serif", "Noto Serif Fallback", serif', fontSize: '14px' }}>
                            {isMarked ? 'Unmark' : 'Mark for Review'}
                        </span>
                    </button>
                </div>

                {/* Only show ABC button for multiple choice questions */}
                {isMultipleChoice && (
                    <button 
                        onClick={() => setIsAbcMode(!isAbcMode)}
                        className="flex items-center text-sm text-gray-600 hover:text-black mr-2 h-full"
                    >
                        <div className={`relative border border-gray-300 rounded-sm w-8 h-8 flex items-center justify-center ${isAbcMode ? 'bg-[#384cc0]' : 'bg-transparent'}`}>
                            <span className={`text-[12px] font-medium ${isAbcMode ? 'text-white' : 'text-gray-500'} font-serif`}>ABC</span>
                            {isAbcMode && (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="absolute w-8 h-8 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18 6L6 18"></path>
                                </svg>
                            )}
                            {!isAbcMode && (
                                 <div className="absolute w-full h-px bg-gray-500 transform rotate-[-45deg]"></div>
                            )}
                        </div>
                    </button>
                )}
            </div>
            
            {/* Question Text */}
            <div className="mb-6 font-serif text-[18px] leading-[28px] text-black pl-2 prose max-w-none mt-2" style={{ fontFamily: '"Noto Serif", serif' }}>
                <div className="annotation-tool relative">
                    {/* Image rendering controlled by showImage prop */}
                    {showImage && question.content.image_url && (
                        <div className="mb-4">
                            {question.content.image_description && (
                                    <div className="mb-2 text-left text-[18px]">
                                        <Latex>{question.content.image_description}</Latex>
                                    </div>
                                )}
                            <img 
                                src={question.content.image_url} 
                                alt={question.content.image_description || "Question Graphic"} 
                                className="max-w-full h-auto rounded-lg border border-gray-200 mx-auto" 
                                style={{
                                    display: 'block',
                                    marginBottom: '20px',
                                    marginTop: '16px'
                                }}
                            />
                        </div>
                    )}
                    <Latex>{question.content.question}</Latex>
                    
                    {question.equation_latex && (
                        <div className="mt-4 flex justify-center">
                             <BlockMath math={question.equation_latex} />
                        </div>
                    )}
                </div>
            </div>

            {/* Answer Area */}
            <div className="space-y-3">
                {isMultipleChoice ? (
                    Object.entries(question.content.options).map(([key, value]) => {
                        if (!value) return null
                        const isSelected = selectedAnswer === key
                        const isCrossed = crossedAnswers[key]
                        
                        return (
                            <div key={key} className="relative flex items-center w-full mb-2 pr-10">
                                {/* Elimination Icon Button - Only visible in ABC mode or if crossed */}
                                {(isAbcMode || isCrossed) && (
                                    <button 
                                        className="absolute right-0"
                                        style={{ width: '28px', height: '28px', cursor: 'default' }}
                                        onClick={(e) => { e.stopPropagation(); toggleCrossOutDirect(key); }}
                                    >
                                        <div className="eliminate-icon relative w-full h-full flex items-center justify-center">
                                            <span style={{
                                                fontSize: '15px',
                                                fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                                                fontWeight: 400,
                                                color: 'oklch(0.145 0 0)'
                                            }}>{key}</span>
                                            {isCrossed && (
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="eliminate-dash" 
                                                    style={{ 
                                                        width: '20px', 
                                                        height: '20px', 
                                                        position: 'absolute', 
                                                        top: '50%', 
                                                        left: '50%', 
                                                        transform: 'translate(-50%, -50%) rotate(45deg)',
                                                        color: 'rgb(156, 163, 175)'
                                                    }}>
                                                    <line x1="0" y1="10" x2="20" y2="10"></line>
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (isAbcMode) {
                                            toggleCrossOutDirect(key)
                                        } else {
                                            !isCrossed && onAnswerChange(key)
                                        }
                                    }}
                                    disabled={isCrossed && !isAbcMode}
                                    className={`w-full p-3 text-left border-2 rounded-lg text-[18px] flex items-center gap-3 cursor-pointer
                                        ${isSelected 
                                            ? 'bg-[#e6f4ff] ring-1 ring-[#0077c8] border-[#0077c8]' 
                                            : isCrossed
                                                ? 'bg-transparent border-gray-200' 
                                                : 'bg-white hover:bg-gray-200 border-black'
                                        }
                                    `}
                                    style={{
                                        fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                                        lineHeight: '24px',
                                        ...(isCrossed ? {
                                            color: 'rgb(156, 163, 175)',
                                            borderColor: 'rgb(156, 163, 175)'
                                        } : {})
                                    }}
                                >
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold border text-xs
                                        ${isSelected 
                                            ? 'bg-black text-white border-black' 
                                            : isCrossed 
                                                ? 'bg-transparent border-[rgb(156,163,175)] text-[rgb(156,163,175)]'
                                                : 'bg-transparent border-black text-black'
                                        }
                                    `}>
                                        <span>{key}</span>
                                    </div>
                                    <div className="flex-1">
                                        <span className={`font-serif`} style={{ 
                                            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                                            color: isCrossed ? 'rgb(156, 163, 175)' : 'inherit'
                                        }}>
                                            <Latex forceInline>{value as string}</Latex>
                                        </span>
                                    </div>
                                    
                                    {/* Cross out overlay - The gray line */}
                                    {isCrossed && (
                                        <div className="absolute inset-0 z-10 pointer-events-none">
                                            <div className="absolute left-[-3px] h-[2px] w-full" 
                                                style={{ 
                                                    top: '24px', 
                                                    backgroundColor: 'rgb(107, 114, 128)',
                                                    width: 'calc(100% + 3px)'
                                                }}></div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex h-full w-full gap-8">
                        {/* SPR Input Section */}
                         <div className="w-full pt-4 flex flex-col">
                            <label className="block text-sm font-bold text-black mb-4 font-sans">
                                Enter your answer
                            </label>
                            <input
                                data-slot="input"
                                type="text"
                                placeholder="Enter your answer (e.g., 5.566, -5.566, 2/3, -2/3)"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 min-w-0 bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-full p-3 text-base border-2 border-black rounded-lg select-text"
                                style={{
                                    appearance: 'auto',
                                    backgroundColor: 'rgba(0, 0, 0, 0)',
                                    borderBottomColor: 'rgb(0, 0, 0)',
                                    borderBottomLeftRadius: '10px',
                                    borderBottomRightRadius: '10px',
                                    borderBottomStyle: 'solid',
                                    borderBottomWidth: '2px',
                                    borderLeftColor: 'rgb(0, 0, 0)',
                                    borderLeftStyle: 'solid',
                                    borderLeftWidth: '2px',
                                    borderRightColor: 'rgb(0, 0, 0)',
                                    borderRightStyle: 'solid',
                                    borderRightWidth: '2px',
                                    borderTopColor: 'rgb(0, 0, 0)',
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '10px',
                                    borderTopStyle: 'solid',
                                    borderTopWidth: '2px',
                                    boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
                                    boxSizing: 'border-box',
                                    color: 'oklch(0.145 0 0)',
                                    cursor: 'text',
                                    display: 'flex',
                                    fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                                    fontSize: '18px',
                                    height: '42px',
                                    lineHeight: '24px',
                                    opacity: 1,
                                    outlineColor: 'oklab(0.708 0 0 / 0.5)'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
