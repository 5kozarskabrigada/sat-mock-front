'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { examsAPI, questionsAPI, studentExamsAPI } from '@/lib/api-client';
import ExamRunner from './exam-runner';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const id = params.id as string;
  const isAdminPreview = searchParams.get('preview') === 'true';
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [studentExam, setStudentExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadExamData() {
      try {
        // 1. Fetch exam details
        const examResponse = await examsAPI.getById(id);
        const examData = examResponse.data;
        
        if (!examData || examData.deleted_at) {
          router.push('/student');
          return;
        }
        
        setExam(examData);

        // 2. Fetch questions
        const questionsResponse = await questionsAPI.getByExam(id);
        setQuestions(questionsResponse.data || []);

        // Admin preview bypass
        if (isAdminPreview && user.role === 'admin') {
          setLoading(false);
          return;
        }

        // 3. Check if student has started this exam
        const myExamsResponse = await studentExamsAPI.getMyExams();
        const myExam = myExamsResponse.data.find(
          (se: any) => se.exam_id === id
        );

        if (!myExam) {
          router.push('/student');
          return;
        }

        setStudentExam(myExam);

        // Check if exam is completed
        if (myExam.status === 'completed') {
          // Verify it actually has answers
          const answersResponse = await studentExamsAPI.getAnswers(myExam.id);
          if (answersResponse.data.length > 0) {
            router.push('/student/completed');
            return;
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load exam:', err);
        setError(err.response?.data?.message || 'Failed to load exam');
        setLoading(false);
      }
    }

    loadExamData();
  }, [id, user, authLoading, isAdminPreview, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/student')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exam || !user) {
    return null;
  }

  const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';
  const studentExamIdToUse = isAdminPreview && user.role === 'admin'
    ? `preview-${user.id}`
    : studentExam?.id;

  return (
    <ExamRunner
      exam={exam}
      questions={questions}
      studentExamId={studentExamIdToUse}
      studentName={isAdminPreview ? `${studentName} (Admin Preview)` : studentName}
      isAdminPreview={isAdminPreview}
    />
  );
}
