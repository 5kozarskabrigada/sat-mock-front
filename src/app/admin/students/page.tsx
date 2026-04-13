
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage enrolled students and credentials.</p>
        </div>
        <CreateStudentModal onSuccess={handleRefresh} />
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Enrolled Students ({students?.length || 0})</h3>
        </div>
        <div className="bg-white">
            <StudentList students={students || []} onUpdate={handleRefresh} />
        </div>
      </div>
    </div>
  );
}
