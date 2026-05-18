
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, examsAPI } from '@/lib/api-client';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [activeExamCount, setActiveExamCount] = useState(0);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      try {
        // Fetch all data in parallel
        const [usersResponse, examsResponse] = await Promise.all([
          usersAPI.getAll({ role: 'student' }),
          examsAPI.getAll(),
        ]);

        const students = usersResponse.data;
        const exams = examsResponse.data;

        // Calculate stats
        setStudentCount(students.length);
        setActiveExamCount(exams.filter((e: any) => e.status === 'active' && !e.deleted_at).length);

        // Get recent students (last 5)
        const sortedStudents = [...students].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentStudents(sortedStudents.slice(0, 5));

        // Get recent exams (last 5, excluding deleted)
        const activeExams = exams.filter((e: any) => !e.deleted_at);
        const sortedExams = [...activeExams].sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentExams(sortedExams.slice(0, 5));

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#123b71] to-[#1a5490] rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-blue-100">Welcome back! Here's what's happening with your SAT Mock Platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Students */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 border-l-4 border-indigo-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Students</p>
              <p className="text-4xl font-bold mt-2">{studentCount}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/students" className="mt-4 inline-flex items-center text-sm font-semibold text-white hover:text-indigo-100 transition-colors">
            View all <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        
        {/* Card 2: Exams */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 border-l-4 border-teal-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium uppercase tracking-wide">Active Exams</p>
              <p className="text-4xl font-bold mt-2">{activeExamCount}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/exams" className="mt-4 inline-flex items-center text-sm font-semibold text-white hover:text-teal-100 transition-colors">
            Manage exams <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        
        {/* Card 3: Classrooms */}
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 border-l-4 border-violet-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium uppercase tracking-wide">Classrooms</p>
              <p className="text-4xl font-bold mt-2">-</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <Link href="/admin/classrooms" className="mt-4 inline-flex items-center text-sm font-semibold text-white hover:text-violet-100 transition-colors">
            View classes <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        
        {/* Card 4: Quick Action */}
        <Link href="/admin/exams" className="bg-gradient-to-br from-[#123b71] to-[#1a5490] rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 flex flex-col items-center justify-center text-center group border-l-4 border-[#0d2a4d]">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3 group-hover:bg-white/30 transition-colors">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold uppercase">Create Exam</h3>
          <p className="text-blue-100 text-xs mt-1 font-medium">Start new assessment</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Recent Students</h2>
            <Link href="/admin/students" className="text-sm font-semibold text-white hover:text-indigo-100 transition-colors inline-flex items-center">
              View All <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {recentStudents?.map((student: any) => (
              <li key={student.id} className="p-4 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700">
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {(!recentStudents || recentStudents.length === 0) && (
              <li className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No recent students</p>
              </li>
            )}
          </ul>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Recent Exams</h2>
            <Link href="/admin/exams" className="text-sm font-semibold text-white hover:text-teal-100 transition-colors inline-flex items-center">
              View All <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {recentExams?.map((exam: any) => (
              <li key={exam.id} className="p-4 hover:bg-teal-50 transition-colors">
                <Link href={`/admin/exams/${exam.id}`} className="block group">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                        {exam.title}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${
                          exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {exam.status}
                        </span>
                        {exam.code && (
                          <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded-lg font-medium">
                            {exam.code}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {(!recentExams || recentExams.length === 0) && (
              <li className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No recent exams</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
