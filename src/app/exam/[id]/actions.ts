import { studentExamsAPI, activityLogsAPI } from '@/lib/api-client';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Save answers periodically during exam (using optimized batch API)
export async function saveAnswersProgress(
  studentExamId: string,
  answers: Record<string, any>
) {
  try {
    // Convert answers object to array format for batch API
    const answersArray = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      answerValue: value?.toString().trim() || '',
    }));

    if (answersArray.length === 0) {
      return { success: true };
    }

    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await studentExamsAPI.saveAnswersBatch(studentExamId, answersArray);
        return { success: true };
      } catch (error: any) {
        lastError = error;
        if (attempt < 3) {
          await delay(250 * attempt);
        }
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Failed to save answer progress:', error);
    return { error: 'Failed to save progress' };
  }
}

// Submit exam (triggers backend grading and completion)
export async function submitExam(
  studentExamId: string,
  answers: Record<string, any>
) {
  try {
    // First save all final answers
    const saveResult = await saveAnswersProgress(studentExamId, answers);
    if (saveResult.error) {
      return { error: saveResult.error };
    }

    // Then mark as complete (backend calculates scores)
    await studentExamsAPI.complete(studentExamId);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to submit exam:', error);
    return { error: 'Failed to save your answers. Please try again.' };
  }
}

// Log lockdown violation
export async function logLockdownViolation(
  studentExamId: string,
  details?: string
) {
  try {
    await studentExamsAPI.recordViolation(studentExamId);

    // Also log to activity logs
    const isDisqualification = details?.toLowerCase().includes('disqualified');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.id) {
      await activityLogsAPI.create({
        userId: user.id,
        studentExamId,
        type: isDisqualification ? 'exam_disqualified' : 'lockdown_violation',
        details: details || 'Student attempted to leave the exam environment',
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to log lockdown violation:', error);
    return { success: false };
  }
}

// Log exam started
export async function logExamStarted(studentExamId: string) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.id) {
      await activityLogsAPI.create({
        userId: user.id,
        studentExamId,
        type: 'exam_started',
        details: 'Student started the mock exam',
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to log exam started:', error);
    return { success: false };
  }
}

// Heartbeat to keep exam session alive
export async function heartbeat(studentExamId: string) {
  // Backend updates updatedAt timestamp automatically on any request
  // No need for explicit heartbeat endpoint
  return { success: true };
}

// Disqualify student (handled by backend via lockdown violation)
export async function disqualifyStudent(studentExamId: string, details: string) {
  return logLockdownViolation(studentExamId, `Disqualified: ${details}`);
}
