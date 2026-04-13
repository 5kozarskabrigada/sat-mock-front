
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { examsAPI, studentExamsAPI } from '@/lib/api-client';
import Link from 'next/link';

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const id = params?.id as string;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [examResponse, resultsResponse] = await Promise.all([
          examsAPI.getById(id),
          studentExamsAPI.getExamResults(id),
        ]);

        if (!examResponse.data) {
          router.push('/admin/exams');
          return;
        }

        setExam(examResponse.data);
        setResults(resultsResponse.data);
      } catch (error) {
        console.error('Failed to load results:', error);
        router.push('/admin/exams');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, router, id]);

  if (authLoading || loading || !exam) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <Link href={`/admin/exams/${id}`} className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Exam Details</Link>
            <h1 className="text-2xl font-bold text-gray-900">Results: {exam.title}</h1>
          </div>
       </div>

       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Student Submissions</h3>
          </div>
          <div className="border-t border-gray-200">
             <ul role="list" className="divide-y divide-gray-200">
                {!results || results.length === 0 ? (
                    <li className="px-4 py-5 sm:px-6 text-gray-500">No completed submissions yet.</li>
                ) : (
                    results.map((result: any) => (
                        <li key={result.id} className="hover:bg-gray-50">
                            <Link href={`/admin/exams/${id}/results/${result.id}`} className="block px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {result.first_name?.[0]}{result.last_name?.[0]}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                          {result.first_name} {result.last_name}
                                            </div>
                                        <div className="text-sm text-gray-500">{result.student_email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            {result.lockdown_violations > 0 && (
                                                <div className="text-xs font-bold text-red-600 mb-1">
                                                    {result.lockdown_violations} Security Violations
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-900 font-medium">
                                                {result.status === 'completed' ? 'View Report' : (
                                                    <span className="text-indigo-600">In Progress</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {result.status === 'completed' 
                                                  ? `Completed ${new Date(result.completed_at).toLocaleDateString()}`
                                                  : `Started ${new Date(result.started_at).toLocaleDateString()}`
                                                }
                                            </div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))
                )}
             </ul>
          </div>
       </div>
    </div>
  )
}
