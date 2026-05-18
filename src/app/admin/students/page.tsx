
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api-client';
import CreateStudentModal from './create-student-modal';
import StudentList from './student-list';

export default function StudentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/login');
 return;
    }

    async function loadStudents() {
      try {
        const response = await usersAPI.getAll({ role: 'student' });
        setStudents(response.data);
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [user, authLoading, router, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="mt-2 text-sm text-gray-600">Manage enrolled students and send credentials via email</p>
        </div>
        <CreateStudentModal onSuccess={handleRefresh} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-5 shadow-lg sm:p-6">
          <dt>
            <div className="absolute rounded-md bg-white/20 p-3 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-indigo-100">Total Students</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-3xl font-semibold text-white">{students?.length || 0}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-5 shadow-lg sm:p-6">
          <dt>
            <div className="absolute rounded-md bg-white/20 p-3 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-emerald-100">Active</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-3xl font-semibold text-white">{students?.length || 0}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 px-4 py-5 shadow-lg sm:p-6">
          <dt>
            <div className="absolute rounded-md bg-white/20 p-3 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-violet-100">Email Enabled</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-3xl font-semibold text-white">Yes</p>
          </dd>
        </div>
      </div>
      
      {/* Students List Card */}
      <div className="bg-white shadow-xl ring-1 ring-gray-200 rounded-2xl overflow-hidden">
        <StudentList students={students || []} onUpdate={handleRefresh} />
      </div>
    </div>
  );
}
