'use client'

import { useState, useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import parse from 'html-react-parser'

const Latex = ({ children }: { children: string }) => {
    if (!children) return null;
    
    const options = {
        replace: (domNode: any) => {
            if (domNode.type === 'text') {
                const text = domNode.data
                const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g
                const parts = text.split(regex)
                
                if (parts.length > 1) {
                    return (
                        <>
                            {parts.map((part: string, index: number) => {
                                if (part.startsWith('$$') && part.endsWith('$$')) {
                                    return <BlockMath key={index} math={part.slice(2, -2)} />
                                } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                                    return <BlockMath key={index} math={part.slice(2, -2)} />
                                } else if (part.startsWith('$') && part.endsWith('$')) {
                                    return <InlineMath key={index} math={part.slice(1, -1)} />
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
                    if (display === 'block') {
                        return <BlockMath math={latex} />
                    }
                    return <InlineMath math={latex} />
                }
            }
        }
    }

    return (
        <span className="prose prose-lg max-w-none text-[var(--sat-text)]">
            {parse(children, options)}
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
  isAnnotateActive
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
}) {
  const isMultipleChoice = question.content.options && question.content.options.A
  const [inputValue, setInputValue] = useState(selectedAnswer || '')
  const [crossedAnswers, setCrossedAnswers] = useState<Record<string, boolean>>({})
  const [isAbcMode, setIsAbcMode] = useState(false)
  
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

      let node = selection.anchorNode
      while (node && node !== passageRef.current) {
          if (node.nodeType === 1 && (node as Element).classList.contains('annotation-highlight')) {
               const el = node as HTMLElement
               el.className = `annotation-highlight border-b-2 border-${color}-500 cursor-pointer`
               el.dataset.color = color
               el.style.backgroundColor = '' 
               el.style.borderBottomColor = ''
               if (color === 'yellow') el.style.backgroundColor = 'rgba(254, 240, 138, 0.4)'
               if (color === 'blue') el.style.backgroundColor = 'rgba(186, 230, 253, 0.4)'
               if (color === 'pink') el.style.backgroundColor = 'rgba(251, 207, 232, 0.4)'
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
      span.dataset.color = color
      if (color === 'yellow') span.style.backgroundColor = 'rgba(254, 240, 138, 0.4)'
      if (color === 'blue') span.style.backgroundColor = 'rgba(186, 230, 253, 0.4)'
      if (color === 'pink') span.style.backgroundColor = 'rgba(251, 207, 232, 0.4)'
      span.style.borderBottomWidth = '1px'
      span.style.borderBottomStyle = 'solid'
      if (color === 'yellow') span.style.borderBottomColor = '#eab308'
      if (color === 'blue') span.style.borderBottomColor = '#3b82f6'
      if (color === 'pink') span.style.borderBottomColor = '#ec4899'
      if (color === 'underline') {
           span.style.backgroundColor = 'transparent'
           span.style.borderBottomColor = 'black'
           span.style.borderBottomWidth = '2px'
      }

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

  const hasPassage = !!question.content.passage && !isMathSection
  const twoColumnLayout = hasPassage

  return (
    <div className="flex-1 flex overflow-hidden relative h-full bg-[var(--sat-bg)]">
      {/* Floating Annotation Menu */}
      {selectionMenu && selectionMenu.show && (
          <div 
            className="fixed z-50 flex items-center bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 space-x-1 annotation-menu transform -translate-x-1/2 -translate-y-full"
            style={{ left: selectionMenu.x, top: selectionMenu.y - 10 }}
          >
              <button onClick={() => applyHighlight('yellow')} className="w-6 h-6 bg-yellow-200 border border-yellow-400 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('blue')} className="w-6 h-6 bg-blue-200 border border-blue-400 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('pink')} className="w-6 h-6 bg-pink-200 border border-pink-400 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('underline')} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:scale-110 transition-transform bg-white">
                 <span className="border-b-2 border-black font-serif">U</span>
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button onClick={removeHighlight} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded" title="Remove Highlight">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.174-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
              </button>
          </div>
      )}

      {/* Main Layout */}
      {twoColumnLayout ? (
          <div className="flex w-full h-full p-4 gap-0 items-start">
              {/* Left: Passage Panel */}
              <div 
                ref={passageRef}
                className="overflow-y-auto content-pane"
                style={{ 
                    width: '50%', 
                    minWidth: '20%',
                    padding: '16px',
                    fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: 'oklch(0.145 0 0)'
                }}
              >
                 {question.content.passage && (
                    <div className="prose max-w-none">
                        <div className="annotation-tool relative">
                            <p className="whitespace-pre-wrap">{question.content.passage}</p>
                        </div>
                    </div>
                 )}
              </div>

              {/* Right: Question Panel */}
              <div 
                className="overflow-y-auto flex flex-col content-pane"
                style={{ 
                    width: 'calc(50% - 5px)', 
                    minWidth: '20%',
                    position: 'relative',
                    left: '5px'
                }}
              >
                 <div className="mb-4">
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
                    />
                 </div>
              </div>
          </div>
      ) : (
          <div className="flex w-full h-full p-4 justify-center">
              {/* Full Width Question Panel */}
              <div className="overflow-y-auto p-4 flex flex-col w-full max-w-[1100px]">
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
                 />
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
    onToggleMark
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
            </div>
            
            {/* Question Text */}
            <div className="mb-6 font-serif text-[15px] leading-[24px] text-black pl-2 prose max-w-none mt-2" style={{ fontFamily: '"Noto Serif", serif' }}>
                <div className="annotation-tool relative">
                    {question.content.image_url && (
                        <div className="mb-4">
                            {question.content.image_description && (
                                    <div className="mb-2">
                                        <Latex>{question.content.image_description}</Latex>
                                    </div>
                                )}
                            <img 
                                src={question.content.image_url} 
                                alt={question.content.image_description || "Question Graphic"} 
                                className="max-w-full h-auto rounded-lg border border-gray-200" 
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
                                    className={`w-full p-3 text-left border-2 rounded-lg text-base flex items-center gap-3 cursor-pointer
                                        ${isSelected 
                                            ? 'bg-[#e6f4ff] ring-1 ring-[#0077c8] border-[#0077c8]' 
                                            : isCrossed
                                                ? 'bg-transparent border-gray-200' 
                                                : 'bg-white hover:bg-gray-200 border-black'
                                        }
                                    `}
                                    style={{
                                        fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
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
                                            <Latex>{value as string}</Latex>
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
                         <div className="w-full p-6 flex flex-col justify-center">
                            <label className="block text-sm font-bold text-black mb-4 font-sans">
                                Enter your answer
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-black rounded-lg font-serif text-xl focus:border-[#0077c8] focus:ring-1 focus:ring-[#0077c8] outline-none placeholder-gray-400 text-black text-center"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
