
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function QuestionsList({ questions, examId }: { questions: any[], examId: string }) {
    const router = useRouter()

    return (
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
            <ul role="list" className="divide-y divide-gray-100">
                {questions.length === 0 ? (
                    <li className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                        <p className="text-sm">No questions added yet.</p>
                        <p className="text-xs mt-1 text-gray-400">Use the form below to add your first question.</p>
                    </li>
                ) : (
                    questions.map((q, index) => (
                        <li 
                            key={q.id} 
                            className="group relative hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                            onClick={() => router.push(`/admin/exams/${examId}/questions/${q.id}`)}
                        >
                            <div className="px-6 py-5">
                                <div className="flex justify-between items-start gap-4">
                                    {/* Question Number & Meta */}
                                    <div className="flex-shrink-0 min-w-[3rem]">
                                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold ring-1 ring-indigo-200">
                                            {index + 1}
                                        </span>
                                    </div>

                                    {/* Content Preview */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                q.section === 'reading_writing' 
                                                ? 'bg-blue-50 text-blue-700 ring-blue-600/20' 
                                                : 'bg-orange-50 text-orange-700 ring-orange-600/20'
                                            }`}>
                                                {q.section === 'reading_writing' ? 'Reading & Writing' : 'Math'}
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                Module {q.module}
                                            </span>
                                            {q.domain && (
                                                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 truncate max-w-[200px]">
                                                    {q.domain}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-2 text-sm text-gray-900 line-clamp-2 font-serif leading-relaxed">
                                            {q.content.question}
                                        </div>

                                        <div className="mt-2 flex items-center text-xs text-gray-500 gap-4">
                                            <span className="flex items-center">
                                                <span className="font-medium text-gray-700 mr-1">Answer:</span> 
                                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">{q.correct_answer}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Edit Indicator (Visible on Hover) */}
                                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}
