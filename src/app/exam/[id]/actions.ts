'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitExam(studentExamId: string, answers: Record<string, any>) {
  const supabase = await createClient()

  // 0. Fetch necessary data to grade the exam
  // We need to fetch the questions that correspond to these answers to check correctness.
  // Ideally, we should fetch all questions for the exam this attempt belongs to.
  
  // Get exam_id from student_exam
  const { data: studentExam } = await supabase
      .from('student_exams')
      .select('exam_id')
      .eq('id', studentExamId)
      .single()
      
  if (!studentExam) {
      return { error: 'Student exam not found' }
  }

  // Fetch all questions for this exam
  const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_answer, section')
      .eq('exam_id', studentExam.exam_id)

  const questionMap = new Map(questions?.map(q => [q.id, q]))

  // 1. Save answers with grading
  const answerInserts = Object.entries(answers).map(([questionId, value]) => {
    const question = questionMap.get(questionId)
    let isCorrect = false
    const answerStr = value?.toString().trim() || ''

    if (question && question.correct_answer) {
        // Support multiple correct answers separated by '|'
        const correctAnswers = question.correct_answer.split('|').map((a: string) => a.trim())
        
        // Check if student answer matches any of the correct answers
        // For Math (SPR), we might want to be more lenient (e.g. 0.5 vs .5), but strict string match is standard for now unless parsed.
        // SAT SPR often allows .5 and 0.5, so let's handle simple number formatting if possible, 
        // but strict string match against provided valid options is safest.
        
        isCorrect = correctAnswers.includes(answerStr)
    }

    return {
        student_exam_id: studentExamId,
        question_id: questionId,
        answer_value: answerStr,
        is_correct: isCorrect
    }
  })

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
