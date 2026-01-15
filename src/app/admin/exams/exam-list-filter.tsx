
'use client'

import Link from 'next/link'
import { useState } from 'react'
import ExamListActions from './exam-list-actions'

interface Exam {
    id: string
    title: string
    description: string
    code: string
    status: string
    type: string
    created_at: string
}

export default function ExamListFilter({ exams }: { exams: Exam[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredExams = exams.filter(exam => {
        const matchesSearch = 
            exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            exam.code.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || exam.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="Search exams by title or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExams.map((exam) => (
                    <div 
                        key={exam.id} 
                        className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
                    >
                        <Link 
                            href={`/admin/exams/${exam.id}`}
                            className="flex-1 p-6 flex flex-col justify-between hover:bg-gray-50/50"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                        exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {exam.status}
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                        {exam.code}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-900 truncate" title={exam.title}>
                                        {exam.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                        {exam.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span className="capitalize px-2 py-1 bg-gray-50 rounded text-xs border border-gray-100">
                                    {exam.type}
                                </span>
                            </div>
                        </Link>
                        
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {new Date(exam.created_at).toLocaleDateString()}
                            </span>
                            <ExamListActions exam={exam} />
                        </div>
                    </div>
                ))}

                {filteredExams.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
