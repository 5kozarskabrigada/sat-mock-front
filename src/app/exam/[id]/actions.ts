'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitExam(studentExamId: string, answers: Record<string, any>) {
  const supabase = await createClient()

  // 0. Fetch necessary data to grade the exam
  const { data: studentExam } = await supabase
    .from('student_exams')
    .select('exam_id, student_id')
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
        const correctAnswers = question.correct_answer.split('|').map((a: string) => a.trim())
        isCorrect = correctAnswers.includes(answerStr)
    }

    return {
        student_exam_id: studentExamId,
        question_id: questionId,
        answer_value: answerStr,
        is_correct: isCorrect
    }
  })

  // 2. Perform DB operations in parallel where possible or streamlined
  const operations = []
  
  if (answerInserts.length > 0) {
    operations.push(supabase.from('student_answers').insert(answerInserts))
  }

  operations.push(
    supabase
      .from('student_exams')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', studentExamId)
  )

  operations.push(
    supabase.from('activity_logs').insert({
        user_id: studentExam.student_id,
        student_exam_id: studentExamId,
        exam_id: studentExam.exam_id,
        type: 'exam_completed',
        details: 'Student submitted the exam'
    })
  )

  const results = await Promise.all(operations)
  const errors = results.filter(r => r.error)
  
  if (errors.length > 0) {
      console.error('Errors during submission:', errors)
  }

  revalidatePath('/student')
  return { success: true }
}

export async function logLockdownViolation(studentExamId: string, details?: string) {
  const supabase = await createClient()
  
  // 1. Log the activity
  const { data: studentExam, error: fetchError } = await supabase
    .from('student_exams')
    .select('exam_id, student_id')
    .eq('id', studentExamId)
    .single()

  if (fetchError) {
    console.error('Error fetching student exam for logging:', fetchError)
  }

  if (studentExam) {
    const isDisqualification = details?.toLowerCase().includes('disqualified')
    const { error: logError } = await supabase.from('activity_logs').insert({
      user_id: studentExam.student_id,
      student_exam_id: studentExamId,
      exam_id: studentExam.exam_id,
      type: isDisqualification ? 'exam_disqualified' : 'lockdown_violation',
      details: details || 'Student attempted to leave the exam environment'
    })
    if (logError) console.error('Failed to log lockdown violation:', logError)
  }

  // 2. Increment violation count
  const { error: rpcError } = await supabase.rpc('increment_lockdown_violations', {
    exam_id: studentExamId
  })

  if (rpcError) {
    console.warn('RPC increment_lockdown_violations failed, falling back to manual update:', rpcError)
    const { data: current } = await supabase
      .from('student_exams')
      .select('lockdown_violations')
      .eq('id', studentExamId)
      .single()

    await supabase
      .from('student_exams')
      .update({ 
        lockdown_violations: (current?.lockdown_violations || 0) + 1 
      })
      .eq('id', studentExamId)
  }

  return { success: true }
}

export async function logExamStarted(studentExamId: string) {
  const supabase = await createClient()
  const { data: studentExam, error: fetchError } = await supabase
    .from('student_exams')
    .select('exam_id, student_id')
    .eq('id', studentExamId)
    .single()

  if (fetchError) {
    console.error('Error fetching student exam for starting log:', fetchError)
  }

  if (studentExam) {
    const { error: logError } = await supabase.from('activity_logs').insert({
      user_id: studentExam.student_id,
      student_exam_id: studentExamId,
      exam_id: studentExam.exam_id,
      type: 'exam_started',
      details: 'Student started the mock exam'
    })
    if (logError) console.error('Failed to log exam started:', logError)
  }
  return { success: true }
}
