
'use client'

import { useState, useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Latex = ({ children }: { children: string }) => {
    if (!children) return null;
    
    // Split by delimiters: $$...$$, $...$, \[...\], \(...\)
    const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g;
    const parts = children.split(regex);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    return <BlockMath key={index} math={part.slice(2, -2)} />;
                } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                    return <BlockMath key={index} math={part.slice(2, -2)} />;
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                    return <InlineMath key={index} math={part.slice(2, -2)} />;
                } else {
                    return (
                        <span key={index}>
                            {part.split('\n').map((subPart, subIndex) => (
                                <span key={subIndex}>
                                    {subPart}
                                    {subIndex < part.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                        </span>
                    );
                }
            })}
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
  }, [])

  // Clear menu on global click
  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest('.annotation-menu')) return
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
                        <img src={question.content.image_url} alt="Question Graphic" className="max-w-full h-auto rounded-lg border border-[var(--sat-border)]" />
                    </div>
                )}
                <Latex>{question.content.question}</Latex>
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
                    <div className="bg-white p-6 rounded-lg border border-[var(--sat-border)] shadow-sm">
                        <label className="block text-sm font-medium text-[var(--sat-text)] mb-2 font-sans">
                            Student-Produced Response
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-[var(--sat-border)] rounded-md font-serif text-xl focus:border-[var(--sat-primary)] focus:ring-1 focus:ring-[var(--sat-primary)] outline-none placeholder-[var(--sat-muted)] text-[var(--sat-text)]"
                            placeholder="Enter answer"
                        />
                        <p className="mt-2 text-xs text-[var(--sat-muted)]">
                            Acceptable formats: integers, decimals (e.g., 3.5), fractions (e.g., 2/3).
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}
