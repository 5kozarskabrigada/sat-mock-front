
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LatexRenderer from '@/components/ui/latex-renderer'
import { deleteQuestion, reorderQuestions } from './actions'
import ConfirmationModal from '@/components/confirmation-modal'

interface Question {
    id: string
    section: string
    module: number
    order_index?: number
    created_at?: string
    domain?: string
    content: {
        question: string
        options?: Record<string, string>
    }
    correctAnswer?: string
    correct_answer?: string
}

function getQuestionPreview(text?: string) {
    if (!text) return 'No question text'

    const withoutHtml = text.replace(/<[^>]*>/g, ' ')
    const compact = withoutHtml.replace(/\s+/g, ' ').trim()

    if (compact.length <= 140) return compact
    return `${compact.slice(0, 140)}...`
}

function sortQuestionsByOrder(questions: Question[]) {
    return [...questions].sort((a, b) => {
        const aOrder = a.order_index ?? Number.MAX_SAFE_INTEGER
        const bOrder = b.order_index ?? Number.MAX_SAFE_INTEGER
        if (aOrder !== bOrder) return aOrder - bOrder

        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0
        return aCreated - bCreated
    })
}

function getAnswerDisplay(question: Question) {
    const answer = (question.correctAnswer ?? question.correct_answer ?? '').toString().trim()
    if (!answer) return 'N/A'

    const optionText = question.content?.options?.[answer]
    if (!optionText) return answer

    return `${answer}: ${getQuestionPreview(optionText)}`
}

function SectionGroup({ title, questions, router, examId, colorClass, ringClass, onUpdate }: { 
    title: string, 
    questions: Question[], 
    router: any, 
    examId: string,
    colorClass: string,
    ringClass: string,
    onUpdate?: () => void
}) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [reordering, setReordering] = useState(false)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [orderedQuestions, setOrderedQuestions] = useState<Question[]>([])

    useEffect(() => {
        setOrderedQuestions(sortQuestionsByOrder(questions))
    }, [questions])

    const handleDelete = async () => {
        if (deletingId) {
            await deleteQuestion(deletingId, examId)
            setDeletingId(null)
            onUpdate?.() // Call the refresh callback
        }
    }

    const persistOrder = async (reordered: Question[]) => {
        if (reordered.length === 0) return

        setReordering(true)
        const result = await reorderQuestions(examId, {
            section: reordered[0].section,
            module: reordered[0].module,
            questionIdsInOrder: reordered.map((q) => q.id),
        })
        setReordering(false)

        if (result.error) {
            alert(result.error)
            setOrderedQuestions(sortQuestionsByOrder(questions))
            return
        }

        onUpdate?.()
    }

    const handleDrop = async (targetId: string) => {
        if (!draggingId || draggingId === targetId) {
            setDraggingId(null)
            return
        }

        const sourceIndex = orderedQuestions.findIndex((q) => q.id === draggingId)
        const targetIndex = orderedQuestions.findIndex((q) => q.id === targetId)
        if (sourceIndex < 0 || targetIndex < 0) {
            setDraggingId(null)
            return
        }

        const reordered = [...orderedQuestions]
        const [moved] = reordered.splice(sourceIndex, 1)
        reordered.splice(targetIndex, 0, moved)

        setOrderedQuestions(reordered)
        setDraggingId(null)
        await persistOrder(reordered)
    }

    if (questions.length === 0) return null

    return (
        <div className="mb-6 last:mb-0">
            <ConfirmationModal 
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-4 py-3 ${colorClass} rounded-lg mb-3 hover:opacity-90 transition-opacity`}
            >
                <div className="flex items-center space-x-2">
                    {isExpanded ? (
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>
                <span className="text-sm font-medium bg-white/50 px-2 py-0.5 rounded text-gray-800">
                    {questions.length} questions · drag to reorder
                </span>
            </button>

            {isExpanded && (
                <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
                    <ul role="list" className="divide-y divide-gray-100">
                        {orderedQuestions.map((q, index) => (
                            <li 
                                key={q.id} 
                                draggable={!reordering}
                                className={`group relative hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${draggingId === q.id ? 'opacity-60' : ''}`}
                                onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = 'move'
                                    setDraggingId(q.id)
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    e.dataTransfer.dropEffect = 'move'
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    void handleDrop(q.id)
                                }}
                                onDragEnd={() => setDraggingId(null)}
                                onClick={() => {
                                    if (!draggingId) {
                                        router.push(`/admin/exams/${examId}/questions/${q.id}`)
                                    }
                                }}
                            >
                                <div className="px-6 py-5">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="shrink-0 min-w-12">
                                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ring-1 ${ringClass}`}>
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {q.domain && (
                                                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 truncate max-w-50">
                                                        {q.domain}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                Preview: {getQuestionPreview(q.content.question)}
                                            </p>
                                            
                                            <div className="mt-2 text-sm text-gray-900 line-clamp-3 font-serif leading-relaxed">
                                                <LatexRenderer>{q.content.question}</LatexRenderer>
                                            </div>

                                            <div className="mt-2 flex items-center text-xs text-gray-500 gap-4">
                                                <span className="flex items-center">
                                                    <span className="font-medium text-gray-700 mr-1">Answer:</span> 
                                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">{getAnswerDisplay(q)}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 self-center flex items-center gap-2">
                                            <div className="p-2 text-gray-400" title="Drag to reorder">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h.01M8 15h.01M12 9h.01M12 15h.01M16 9h.01M16 15h.01" />
                                                </svg>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeletingId(q.id)
                                                }}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Question"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default function QuestionsList({ questions, examId, onUpdate }: { questions: any[], examId: string, onUpdate?: () => void }) {
    const router = useRouter()

    const handleViewAsStudent = () => {
        // Open exam runner in a new tab with preview mode
        window.open(`/exam/${examId}?preview=true`, '_blank')
    }

    if (questions.length === 0) {
        return (
            <div className="bg-gray-50 shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden px-6 py-12 text-center text-gray-500">
                <p className="text-sm">No questions added yet.</p>
                <p className="text-xs mt-1 text-gray-400">Use the form below to add your first question.</p>
            </div>
        )
    }

    // Filter and sort questions
    const rwM1 = questions.filter((q: any) => q.section === 'reading_writing' && q.module === 1)
    const rwM2 = questions.filter((q: any) => q.section === 'reading_writing' && q.module === 2)
    const mathM1 = questions.filter((q: any) => q.section === 'math' && q.module === 1)
    const mathM2 = questions.filter((q: any) => q.section === 'math' && q.module === 2)

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button 
                    onClick={handleViewAsStudent}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View as Student
                </button>
            </div>
            <SectionGroup 
                title="Reading & Writing - Module 1" 
                questions={rwM1} 
                router={router} 
                examId={examId}
                colorClass="bg-blue-50"
                ringClass="bg-blue-50 text-blue-700 ring-blue-200"
                onUpdate={onUpdate}
            />
            <SectionGroup 
                title="Reading & Writing - Module 2" 
                questions={rwM2} 
                router={router} 
                examId={examId}
                colorClass="bg-blue-50"
                ringClass="bg-blue-50 text-blue-700 ring-blue-200"
                onUpdate={onUpdate}
            />
            <SectionGroup 
                title="Math - Module 1" 
                questions={mathM1} 
                router={router} 
                examId={examId}
                colorClass="bg-orange-50"
                ringClass="bg-orange-50 text-orange-700 ring-orange-200"
                onUpdate={onUpdate}
            />
            <SectionGroup 
                title="Math - Module 2" 
                questions={mathM2} 
                router={router} 
                examId={examId}
                colorClass="bg-orange-50"
                ringClass="bg-orange-50 text-orange-700 ring-orange-200"
                onUpdate={onUpdate}
            />
        </div>
    )
}
