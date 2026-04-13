
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteExam } from './actions';
import ConfirmationModal from '@/components/confirmation-modal';

export default function DeleteExamButton({ examId }: { examId: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await deleteExam(examId);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Successfully deleted, navigate back to exams list
        router.push('/admin/exams');
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsModalOpen(true)}
        className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Delete Exam'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Exam"
        message="Are you sure you want to delete this exam? It will be moved to the recycle bin and can be restored later."
        confirmText="Delete"
        isDangerous={true}
      />
    </>
  );
}
