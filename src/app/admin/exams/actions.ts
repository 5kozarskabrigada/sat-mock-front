
import { examsAPI } from '@/lib/api-client';

export async function createExam(title: string, description: string, type: string) {
  // Generate simple random code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return { error: 'Unauthorized - please log in' };
  }

  const user = JSON.parse(userStr);

  try {
    const response = await examsAPI.create({
      title,
      description,
      code,
      created_by: user.id,
      status: 'draft',
    });

    return { success: true, examId: response.data.id };
  } catch (error: any) {
    console.error('Create exam error:', error);
    return { error: error.response?.data?.message || error.message || 'Failed to create exam' };
  }
}
