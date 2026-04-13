
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { examsAPI, questionsAPI, classroomsAPI, studentExamsAPI } from '@/lib/api-client';
import Link from 'next/link';
import AddQuestionForm from './add-question-form';
import ExamStatusToggle from './exam-status-toggle';
import DeleteExamButton from './delete-exam-button';
import QuestionsList from './questions-list';
import ExamCodeEditor from './exam-code-editor';

export default function ExamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any[]>([]);
  const [totalStudentsInClassroom, setTotalStudentsInClassroom] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const id = params?.id as string;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    async function loadExamData() {
      try {
        // Run all queries in parallel for faster loading
        const [examResponse, questionsResponse, classroomsResponse, participationResponse] = await Promise.all([
          examsAPI.getById(id),
          questionsAPI.getByExam(id),
          classroomsAPI.getAll(),
          studentExamsAPI.getExamParticipation(id),
        ]);

        const examData = examResponse.data;
        if (!examData || examData.deleted_at) {
          router.push('/admin/exams');
          return;
        }

        setExam(examData);
        setQuestions(questionsResponse.data.filter((q: any) => !q.deleted_at));
        setClassrooms(classroomsResponse.data);
        setParticipation(participationResponse.data);

        // Fetch total students in the exam's classroom (if any)
        if (examData.classroom_id) {
          const studentsResponse = await classroomsAPI.getStudents(examData.classroom_id);
          setTotalStudentsInClassroom(studentsResponse.data.length);
        } else {
          setTotalStudentsInClassroom(0);
        }

      } catch (error) {
        console.error('Failed to load exam data:', error);
        router.push('/admin/exams');
      } finally {
        setLoading(false);
      }
    }

    loadExamData();
  }, [user, authLoading, router, id, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  if (authLoading || loading || !exam) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const studentsJoinedCount = participation?.length || 0;
  
  // Define "Active/Live" as in_progress AND updated within the last 60 seconds
  const activeThreshold = new Date(Date.now() - 60 * 1000).getTime();
  const studentsActiveCount = participation?.filter((p: any) => {
    if (p.status !== 'in_progress' || !p.updated_at) return false;
    const lastUpdate = new Date(p.updated_at).getTime();
    return lastUpdate > activeThreshold;
  }).length || 0;

  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                 <li><Link href="/admin/exams" className="text-gray-500 hover:text-gray-700 text-sm">Exams</Link></li>
                 <li><span className="text-gray-300">/</span></li>
                 <li><span className="text-gray-900 text-sm font-medium" aria-current="page">{exam.code}</span></li>
              </ol>
           </nav>
           <h1 className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">{exam.title}</h1>
           <p className="mt-1 text-sm text-gray-500">{exam.description || 'No description provided.'}</p>
        </div>
        <div className="flex items-center gap-3">
             <Link 
                href={`/admin/exams/${exam.id}/results`}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
                <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Results
            </Link>
             <ExamStatusToggle 
                examId={exam.id} 
                status={exam.status} 
                classrooms={classrooms || []} 
                lockdownPolicy={exam.lockdown_policy}
                currentClassroomId={exam.classroom_id || ''}
                onUpdate={handleRefresh}
             />
             <DeleteExamButton examId={exam.id} />
        </div>
      </div>

      {/* Stats / Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
         <div className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl px-6 py-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
            <dd className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(exam.status)}`}>
                    {exam.status}
                </span>
            </dd>
         </div>
         <div className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl px-6 py-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Participation</dt>
            <dd className="mt-2 text-lg font-semibold text-gray-900 tracking-tight">
                {studentsActiveCount} / {totalStudentsInClassroom > 0 ? totalStudentsInClassroom : '1'} 
                <span className="ml-2 text-xs font-normal text-gray-500">Live Students</span>
            </dd>
         </div>
         <div className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl px-6 py-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Enrollment</dt>
            <dd className="mt-2 text-lg font-semibold text-gray-900 tracking-tight">
                {studentsJoinedCount}
                <span className="ml-2 text-xs font-normal text-gray-500">Ever Joined</span>
            </dd>
         </div>
         <div className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl px-6 py-5">
            <ExamCodeEditor examId={exam.id} currentCode={exam.code || ''} />
         </div>
         <div className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-xl px-6 py-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Lockdown Policy</dt>
            <dd className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${exam.lockdown_policy === 'disqualify' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {exam.lockdown_policy === 'disqualify' ? 'Strict (Disqualify)' : 'Standard (Log Only)'}
                </span>
            </dd>
         </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Questions ({questions?.length || 0})</h2>
            <span className="text-sm text-gray-500">
                Sorted by creation order
            </span>
        </div>
        
        {/* List Questions */}
        <QuestionsList questions={questions || []} examId={exam.id} onUpdate={handleRefresh} />

        <AddQuestionForm examId={exam.id} onSuccess={handleRefresh} />
      </div>
    </div>
  );
}

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Questions ({questions?.length || 0})</h2>
            <span className="text-sm text-gray-500">
                Sorted by creation order
            </span>
        </div>
        
        {/* List Questions */}
        <QuestionsList questions={questions || []} examId={exam.id} />

        <AddQuestionForm examId={exam.id} />
      </div>
    </div>
  )
}
