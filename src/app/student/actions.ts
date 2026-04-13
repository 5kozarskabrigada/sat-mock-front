
import { studentExamsAPI, examsAPI, classroomsAPI, activityLogsAPI } from '@/lib/api-client';

export async function joinExam(code: string) {
  const trimmedCode = code.trim().toUpperCase();

  try {
    // Get authenticated user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return { error: 'Please log in first', redirect: '/login' };
    }
    
    const user = JSON.parse(userStr);

    // 1. Find the exam by code
    const examsResponse = await examsAPI.getAll();
    const exam = examsResponse.data.find(
      (e: any) => e.code?.toUpperCase() === trimmedCode && !e.deleted_at
    );

    if (!exam) {
      return { error: 'Invalid exam code' };
    }

    // 2. Check if exam is active
    if (exam.status !== 'active') {
      return { error: 'This exam has not been started by the instructor yet.' };
    }

    // 3. Check Classroom Access (if exam is assigned to a classroom)
    if (exam.classroom_id) {
      try {
        const classroomResponse = await classroomsAPI.getStudents(exam.classroom_id);
        const isEnrolled = classroomResponse.data.some(
          (student: any) => student.id === user.id
        );

        if (!isEnrolled) {
          return { error: 'You are not enrolled in the classroom assigned to this exam.' };
        }
      } catch (error) {
        return { error: 'Unable to verify classroom enrollment.' };
      }
    }

    // 4. Check if already started
    const myExamsResponse = await studentExamsAPI.getMyExams();
    const existingAttempt = myExamsResponse.data.find(
      (se: any) => se.exam_id === exam.id
    );

    if (existingAttempt) {
      if (existingAttempt.status === 'completed' || existingAttempt.status === 'disqualified') {
        return { error: 'You have already submitted this exam or have been disqualified.' };
      }
      // Strict Join Policy: Cannot use code again if already started.
      return { error: 'You have already joined this exam. Please resume it from your dashboard.' };
    }

    // 5. Create new student exam attempt
    const newAttemptResponse = await studentExamsAPI.start(exam.id);
    const newAttempt = newAttemptResponse.data;

    // 6. Log joining activity
    try {
      await activityLogsAPI.create({
        userId: user.id,
        examId: exam.id,
        studentExamId: newAttempt.id,
        type: 'exam_joined',
        details: `Student joined the exam using code: ${trimmedCode}`,
      });
    } catch (error) {
      console.error('Failed to log exam joined:', error);
      // Non-critical, continue anyway
    }

    // Return success with exam ID for redirect
    return { success: true, examId: exam.id };
    
  } catch (error: any) {
    console.error('Error joining exam:', error);
    return { error: error.response?.data?.message || 'Failed to join exam. Please try again.' };
  }
}
