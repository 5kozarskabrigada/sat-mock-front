
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { questionsAPI } from '@/lib/api-client';
import Link from 'next/link';
import EditQuestionForm from './edit-question-form';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params?.id as string;
  const questionId = params?.questionId as string;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    async function loadQuestion() {
      try {
        const [response, examQuestionsResponse] = await Promise.all([
          questionsAPI.getById(questionId),
          questionsAPI.getByExam(id),
        ]);
        const questionData = response.data;
        
        if (!questionData || questionData.deleted_at) {
          router.push(`/admin/exams/${id}`);
          return;
        }

        const sameSectionModuleQuestions = (examQuestionsResponse.data || [])
          .filter(
            (q: any) =>
              !q.deleted_at && q.section === questionData.section && Number(q.module) === Number(questionData.module),
          )
          .sort((a: any, b: any) => {
            const aOrder = a.order_index ?? Number.MAX_SAFE_INTEGER;
            const bOrder = b.order_index ?? Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) return aOrder - bOrder;

            const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
            return aCreated - bCreated;
          });

        const currentIndex = sameSectionModuleQuestions.findIndex((q: any) => q.id === questionData.id);
        setQuestionNumber(currentIndex >= 0 ? currentIndex + 1 : null);

        setQuestion({
          ...questionData,
          correctAnswer: questionData.correct_answer,
          explanation: questionData.explanation,
          content: typeof questionData.content === 'string' ? JSON.parse(questionData.content) : questionData.content,
        });
      } catch (error) {
        console.error('Failed to load question:', error);
        router.push(`/admin/exams/${id}`);
      } finally {
        setLoading(false);
      }
    }

    loadQuestion();
  }, [user, authLoading, router, id, questionId]);

  if (authLoading || loading || !question) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <Link href={`/admin/exams/${id}`} className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Exam</Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Question{questionNumber ? ` #${questionNumber}` : ''}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {question.section === 'reading_writing' ? 'Reading & Writing' : 'Math'} - Module {question.module}
            </p>
          </div>
       </div>

       <EditQuestionForm question={question} examId={id} />
    </div>
  );
}
