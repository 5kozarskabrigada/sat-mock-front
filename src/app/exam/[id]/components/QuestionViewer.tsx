
'use client'

import { useState, useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import parse from 'html-react-parser'

const Latex = ({ children }: { children: string }) => {
    if (!children) return null;
    
    // If content contains standard LaTeX delimiters, we try to parse them
    // Note: This simple parser handles LaTeX mixed with HTML from Tiptap
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

            // Handle Tiptap math-component tags
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
        // Only allow selection menu if annotation mode is active
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
        // Only allow interaction with highlights if annotation mode is active
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
  }, [isAnnotateActive]) // Add dependency on isAnnotateActive

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
      span.dataset.color = color
      if (color === 'yellow') span.style.backgroundColor = 'rgba(254, 240, 138, 0.2)'
      if (color === 'blue') span.style.backgroundColor = 'rgba(186, 230, 253, 0.2)'
      if (color === 'pink') span.style.backgroundColor = 'rgba(251, 207, 232, 0.2)'
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
              <button onClick={() => applyHighlight('yellow')} className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('blue')} className="w-6 h-6 bg-blue-100 border border-blue-300 rounded hover:scale-110 transition-transform" />
              <button onClick={() => applyHighlight('pink')} className="w-6 h-6 bg-pink-100 border border-pink-300 rounded hover:scale-110 transition-transform" />
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
          <div className="flex w-full h-full p-4 gap-4">
              {/* Left: Passage Panel (48%) */}
              <div 
                ref={passageRef}
                className="bg-[var(--sat-panel)] rounded-[12px] shadow-[var(--sat-shadow)] overflow-y-auto p-8 font-serif text-[16px] leading-[1.6] text-[var(--sat-text)] border border-[var(--sat-border)]"
                style={{ width: '48%' }}
              >
                 {question.content.passage && (
                    <p className="whitespace-pre-wrap">{question.content.passage}</p>
                 )}
              </div>

              {/* Right: Question Panel (52%) */}
              <div 
                className="bg-[var(--sat-panel)] rounded-[12px] shadow-[var(--sat-shadow)] overflow-y-auto p-8 border border-[var(--sat-border)] flex flex-col"
                style={{ width: '52%' }}
              >
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
      ) : (
          <div className="flex w-full h-full p-4 justify-center">
              {/* Full Width Question Panel */}
              <div className="bg-[var(--sat-panel)] rounded-[12px] shadow-[var(--sat-shadow)] overflow-y-auto p-8 border border-[var(--sat-border)] flex flex-col w-full max-w-[1100px]">
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
    handleInputChange
}: any) {
    return (
        <>
            {/* Header: Question Number + Tools */}
            <div className="flex items-center justify-between mb-6 border-b border-[var(--sat-border)] pb-4">
                <div className="bg-[var(--sat-text)] text-white px-3 py-1 text-sm font-bold rounded shadow-sm font-sans">
                    Question {questionIndex + 1}
                </div>
                <button 
                    onClick={() => setIsAbcMode(!isAbcMode)}
                    className={`rounded px-2 py-1 text-xs font-bold shadow-sm transition-colors
                        ${isAbcMode ? 'bg-[var(--sat-primary)] text-white' : 'bg-white text-[var(--sat-muted)] border border-[var(--sat-border)]'}
                    `}
                    title="Toggle Strikethrough Mode"
                >
                    ABC
                </button>
            </div>

            {/* Question Text */}
            <div className="mb-8 font-serif text-[18px] leading-relaxed text-[var(--sat-text)]">
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
                            className="max-w-full h-auto rounded-lg border border-[var(--sat-border)]" 
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

            {/* Answer Area */}
            <div className="space-y-3">
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
                                    className={`flex-1 text-left p-3 rounded-[10px] border transition-all flex items-center relative
                                        ${isSelected 
                                            ? 'border-[var(--sat-primary)] bg-white shadow-md ring-1 ring-[var(--sat-primary)]' 
                                            : isCrossed
                                                ? 'border-[var(--sat-border)] bg-[var(--sat-bg)] opacity-60' 
                                                : 'border-[var(--sat-text)] bg-white hover:bg-[var(--sat-bg)]'
                                        }
                                    `}
                                >
                                    <div 
                                        className={`
                                            w-6 h-6 rounded-full flex items-center justify-center mr-3 font-sans font-bold text-xs flex-shrink-0
                                            ${isSelected 
                                                ? 'bg-[var(--sat-primary)] text-white' 
                                                : isCrossed
                                                    ? 'bg-transparent border border-[var(--sat-muted)] text-[var(--sat-muted)]'
                                                    : 'bg-white border border-[var(--sat-text)] text-[var(--sat-text)]'
                                            }
                                        `}
                                    >
                                        {key}
                                    </div>
                                    <span className={`font-serif text-[16px] ${isCrossed ? 'text-[var(--sat-muted)] line-through' : 'text-[var(--sat-text)]'}`}>
                                        {value as string}
                                    </span>
                                </button>

                                {/* Strikethrough Toggle (Only visible in ABC mode) */}
                                {isAbcMode && (
                                    <button 
                                        onClick={() => toggleCrossOutDirect(key)}
                                        className={`absolute right-[-40px] w-8 h-8 rounded-full border flex items-center justify-center transition-colors
                                            ${isCrossed 
                                                ? 'border-transparent text-[var(--sat-primary)] hover:underline text-xs font-bold'
                                                : 'border-[var(--sat-border)] text-[var(--sat-text)] hover:bg-[var(--sat-bg)] bg-white'
                                            }
                                        `}
                                        title={isCrossed ? "Undo" : "Cross out"}
                                    >
                                        {isCrossed ? "Undo" : "X"}
                                    </button>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="flex h-full w-full gap-8">
                        {/* Directions Side */}
                        <div className="w-1/2 p-6 border-r border-[var(--sat-border)] overflow-y-auto">
                            <h3 className="font-bold mb-4 text-[var(--sat-text)]">Student-Produced Response Directions</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--sat-text)] mb-6">
                                <li>If you find more than one correct answer, enter only one answer.</li>
                                <li>You can enter up to 5 characters for a positive answer and up to 6 characters (including the negative sign) for a negative answer.</li>
                                <li>If your answer is a fraction that doesn’t fit in the provided space, enter the decimal equivalent.</li>
                                <li>If your answer is a decimal that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li>
                                <li>If your answer is a mixed number (such as 3½), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li>
                                <li>Don’t enter symbols such as a percent sign, comma, or dollar sign.</li>
                            </ul>
                            
                            <h4 className="font-bold mb-3 text-[var(--sat-text)]">Examples</h4>
                            <div className="border border-[var(--sat-border)] text-sm">
                                <div className="grid grid-cols-3 border-b border-[var(--sat-border)] bg-[var(--sat-bg)] font-bold p-2">
                                    <div>Answer</div>
                                    <div>Acceptable ways to enter answer</div>
                                    <div>Unacceptable: will NOT receive credit</div>
                                </div>
                                <div className="grid grid-cols-3 border-b border-[var(--sat-border)] p-2">
                                    <div>3.5</div>
                                    <div>3.5, 3.50, 7/2</div>
                                    <div>3½, 3 1/2</div>
                                </div>
                                <div className="grid grid-cols-3 border-b border-[var(--sat-border)] p-2">
                                    <div>2/3</div>
                                    <div>2/3, .6666, .6667, .666, .667</div>
                                    <div>0.66, .66, 0.67, .67</div>
                                </div>
                                <div className="grid grid-cols-3 p-2">
                                    <div>-1/3</div>
                                    <div>-1/3, -.3333, -0.333</div>
                                    <div>-.33, -0.33</div>
                                </div>
                            </div>
                        </div>

                        {/* Question Side */}
                        <div className="w-1/2 p-6 flex flex-col justify-center">
                            <label className="block text-sm font-medium text-[var(--sat-text)] mb-4 font-sans">
                                Enter your answer
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-[var(--sat-border)] rounded-lg font-serif text-xl focus:border-[var(--sat-primary)] focus:ring-1 focus:ring-[var(--sat-primary)] outline-none placeholder-[var(--sat-muted)] text-[var(--sat-text)] text-center"
                                placeholder="Enter your answer (e.g., 5.566, -5.566, 2/3, -2/3)"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
