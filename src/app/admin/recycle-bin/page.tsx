'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RestoreExamButton, RestoreQuestionButton, PermanentDeleteExamButton, PermanentDeleteQuestionButton } from './buttons'
import PreviewQuestion from './preview-question'
import PreviewExam from './preview-exam'
import LatexRenderer from '@/components/ui/latex-renderer'
import { examsAPI, questionsAPI } from '@/lib/api-client'

export default function RecycleBinPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [deletedExams, setDeletedExams] = useState<any[]>([])
  const [deletedQuestions, setDeletedQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDeletedItems = async () => {
    try {
      const [examsRes, questionsRes] = await Promise.all([
        examsAPI.getDeleted(),
        questionsAPI.getDeleted(),
      ])

      setDeletedExams(Array.isArray(examsRes.data) ? examsRes.data : [])
      setDeletedQuestions(Array.isArray(questionsRes.data) ? questionsRes.data : [])
    } catch (error) {
      console.error('Failed to load recycle bin:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    loadDeletedItems()
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return <div className="text-center py-12 text-gray-500">Loading recycle bin...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recycle Bin</h1>
        <p className="mt-2 text-sm text-gray-700">Restore or permanently delete items.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Deleted Exams</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {deletedExams.length === 0 ? (
                <li className="px-4 py-5 sm:px-6 text-gray-500">No deleted exams found.</li>
              ) : (
                deletedExams.map((exam: any) => (
                  <li key={exam.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600">{exam.title}</p>
                        <PreviewExam exam={exam} />
                      </div>
                      <p className="text-xs text-gray-500">Deleted {exam.deleted_at ? new Date(exam.deleted_at).toLocaleString() : 'Unknown'}</p>
                    </div>
                    <div className="flex space-x-4">
                      <RestoreExamButton examId={exam.id} onChanged={loadDeletedItems} />
                      <PermanentDeleteExamButton examId={exam.id} onChanged={loadDeletedItems} />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Deleted Questions</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {deletedQuestions.length === 0 ? (
                <li className="px-4 py-5 sm:px-6 text-gray-500">No deleted questions found.</li>
              ) : (
                deletedQuestions.map((q: any) => (
                  <li key={q.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                    <div className="max-w-xl">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-md">
                          <LatexRenderer>{q.content?.question || 'No content'}</LatexRenderer>
                        </div>
                        <PreviewQuestion question={q} />
                      </div>
                      <p className="text-xs text-gray-500">
                        Exam: {q.exam_title || 'Unknown'} | Deleted {q.deleted_at ? new Date(q.deleted_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <RestoreQuestionButton questionId={q.id} onChanged={loadDeletedItems} />
                      <PermanentDeleteQuestionButton questionId={q.id} onChanged={loadDeletedItems} />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
