'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { studentExamsAPI } from '@/lib/api-client';
import Logo from '@/components/Logo';
import JoinExamForm from './JoinForm';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeExams, setActiveExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadActiveExams() {
      try {
        const response = await studentExamsAPI.getMyExams();
        // Filter for in_progress exams only
        const inProgress = response.data.filter((exam: any) => exam.status === 'in_progress');
        setActiveExams(inProgress);
      } catch (error) {
        console.error('Failed to load active exams:', error);
      } finally {
        setLoading(false);
      }
    }

    loadActiveExams();
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8 mx-auto w-fit">
          <Logo className="h-24 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the exam code provided by your instructor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <JoinExamForm />
        </div>

        {/* Active Exams List */}
        {activeExams && activeExams.length > 0 && (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Resume Active Exams
            </h3>
            <div className="space-y-4">
              {activeExams.map((attempt: any) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100"
                >
                  <div>
                    <h4 className="font-bold text-indigo-900">
                      {attempt.exam_title || 'Untitled Exam'}
                    </h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      Code: {attempt.exam_code || 'N/A'}
                    </p>
                  </div>
                  <Link
                    href={`/exam/${attempt.exam_id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resume
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
