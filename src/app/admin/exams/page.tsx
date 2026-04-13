
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { examsAPI } from '@/lib/api-client';
import CreateExamModal from './create-exam-modal';
import ExamListFilter from './exam-list-filter';

export default function ExamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    async function loadExams() {
      try {
        const response = await examsAPI.getAll();
        const activeExams = response.data.filter((exam: any) => !exam.deleted_at);
        setExams(activeExams);
      } catch (error) {
        console.error('Failed to load exams:', error);
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="mt-2 text-sm text-gray-700">Create, edit, and manage your mock exams.</p>
        </div>
        <CreateExamModal />
      </div>

      <ExamListFilter exams={exams || []} />
    </div>
  );
}
