'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitExam(studentExamId: string, answers: Record<string, any>) {
  const supabase = await createClient()
  // Use service client for writes to bypass RLS — this is a trusted server action
  const serviceClient = createServiceClient()

  // 0. Verify the student owns this exam attempt
  const { data: studentExam } = await supabase
    .from('student_exams')
    .select('exam_id, student_id, status')
    .eq('id', studentExamId)
    .single()
      
  if (!studentExam) {
      return { error: 'Student exam not found' }
  }

  // Fetch all questions for this exam (excluding soft-deleted)
  const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_answer, section')
      .eq('exam_id', studentExam.exam_id)
      .is('deleted_at', null)

  const questionMap = new Map(questions?.map(q => [q.id, q]))

  // 1. Grade answers
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

  // 2. Delete old answers + insert new ones + update status in parallel (via service client to bypass RLS)
  // First, clear any partial answers from previous failed attempts
  const { error: deleteError } = await serviceClient
    .from('student_answers')
    .delete()
    .eq('student_exam_id', studentExamId)

  if (deleteError) {
    console.error('Failed to clear old answers:', deleteError)
  }

  // Now do the critical operations in parallel — all via service client
  const [answerResult, statusResult] = await Promise.all([
    // Insert graded answers
    answerInserts.length > 0
      ? serviceClient.from('student_answers').insert(answerInserts)
      : Promise.resolve({ error: null }),
    // Mark exam as completed
    serviceClient
      .from('student_exams')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', studentExamId)
  ])

  if (answerResult.error) {
    console.error('Failed to save answers:', answerResult.error)
    return { error: 'Failed to save your answers. Please try again.' }
  }

  if (statusResult.error) {
    console.error('Failed to update exam status:', statusResult.error)
  }

  // 3. Log activity (non-critical, fire and forget)
  serviceClient.from('activity_logs').insert({
    user_id: studentExam.student_id,
    student_exam_id: studentExamId,
    exam_id: studentExam.exam_id,
    type: 'exam_completed',
    details: 'Student submitted the exam'
  }).then(({ error }) => {
    if (error) console.error('Failed to log exam completion:', error)
  })

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

export async function heartbeat(studentExamId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('student_exams')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', studentExamId)
    .eq('status', 'in_progress')
  
  if (error) console.error('Heartbeat failed:', error)
  return { success: !error }
}

export async function disqualifyStudent(studentExamId: string, details: string) {
  const supabase = await createClient()
  
  // 1. Fetch exam info
  const { data: studentExam } = await supabase
    .from('student_exams')
    .select('exam_id, student_id')
    .eq('id', studentExamId)
    .single()

  if (!studentExam) return { error: 'Not found' }

  // 2. Atomic update: status = completed, increment violations, log activity
  const now = new Date().toISOString()
  
  const results = await Promise.all([
    // Update status to completed (disqualified)
    supabase
      .from('student_exams')
      .update({ 
        status: 'completed',
        completed_at: now
      })
      .eq('id', studentExamId),
    
    // Log the disqualification
    supabase.from('activity_logs').insert({
      user_id: studentExam.student_id,
      student_exam_id: studentExamId,
      exam_id: studentExam.exam_id,
      type: 'exam_disqualified',
      details: details
    })
  ])

  // Fallback for increment_lockdown_violations if RPC inside update doesn't work as expected 
  // (PostgREST doesn't support RPC inside update like that easily, better to just increment manually or separate call)
  
  // Separate call for violation increment to be safe
  await supabase.rpc('increment_lockdown_violations', { exam_id: studentExamId })

  revalidatePath('/admin/exams/' + studentExam.exam_id)
  revalidatePath('/student')
  
  return { success: true }
}
