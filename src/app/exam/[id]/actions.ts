
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitExam(studentExamId: string, answers: Record<string, any>) {
  const supabase = await createClient()

  // 1. Save answers
  const answerInserts = Object.entries(answers).map(([questionId, value]) => ({
    student_exam_id: studentExamId,
    question_id: questionId,
    answer_value: value?.toString() || '',
  }))

  if (answerInserts.length > 0) {
    const { error: answersError } = await supabase
      .from('student_answers')
      .insert(answerInserts)
    
    if (answersError) {
      console.error('Error saving answers:', answersError)
      // We might continue to close the exam even if saving answers fails partially, 
      // or return error. For now, we log and proceed to ensure exam is closed.
    }
  }

  // 2. Mark exam as completed
  const { error: updateError } = await supabase
    .from('student_exams')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', studentExamId)

  if (updateError) {
    console.error('Error closing exam:', updateError)
    return { error: 'Failed to submit exam' }
  }

  revalidatePath('/student')
  return { success: true }
}
