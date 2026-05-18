
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
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Students</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{studentCount}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/students" className="mt-4 inline-flex items-center text-sm font-medium text-[#123b71] hover:text-[#0d2a4d] transition-colors">
            View all →
          </Link>
        </div>
        
        {/* Card 2: Exams */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Exams</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{activeExamCount}</p>
            </div>
            <div className="bg-cyan-50 rounded-lg p-3">
              <svg className="h-7 w-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/exams" className="mt-4 inline-flex items-center text-sm font-medium text-[#123b71] hover:text-[#0d2a4d] transition-colors">
            Manage exams →
          </Link>
        </div>
        
        {/* Card 3: Classrooms */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Classrooms</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">-</p>
            </div>
            <div className="bg-sky-50 rounded-lg p-3">
              <svg className="h-7 w-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <Link href="/admin/classrooms" className="mt-4 inline-flex items-center text-sm font-medium text-[#123b71] hover:text-[#0d2a4d] transition-colors">
            View classes →
          </Link>
        </div>
        
        {/* Card 4: Quick Action */}
        <Link href="/admin/exams" className="bg-[#123b71] hover:bg-[#0d2a4d] rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center text-center group">
          <div className="bg-white/20 rounded-full p-3 mb-3 group-hover:bg-white/30 transition-colors">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-base font-semibold">Create Exam</h3>
          <p className="text-blue-100 text-xs mt-1">Start new assessment</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Students</h2>
              <Link href="/admin/students" className="text-sm font-medium text-[#123b71] hover:text-[#0d2a4d] transition-colors">
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentStudents?.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!recentStudents || recentStudents.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-400">No recent students</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Exams</h2>
              <Link href="/admin/exams" className="text-sm font-medium text-[#123b71] hover:text-[#0d2a4d] transition-colors">
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExams?.map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/exams/${exam.id}`} className="text-sm font-medium text-gray-900 hover:text-[#123b71] transition-colors">
                        {exam.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.code && (
                        <span className="text-sm text-gray-600 font-mono">
                          {exam.code}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!recentExams || recentExams.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-400">No recent exams</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
