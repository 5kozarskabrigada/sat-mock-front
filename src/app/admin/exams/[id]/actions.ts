
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addQuestion(examId: string, formData: FormData) {
  const supabase = await createClient()

  const section = formData.get('section') as string
  const module = parseInt(formData.get('module') as string)
  const questionText = formData.get('questionText') as string
  const passage = formData.get('passage') as string
  const optionA = formData.get('optionA') as string
  const optionB = formData.get('optionB') as string
  const optionC = formData.get('optionC') as string
  const optionD = formData.get('optionD') as string
  const correctAnswer = formData.get('correctAnswer') as string
  const explanation = formData.get('explanation') as string
  const domain = formData.get('domain') as string
  const imageUrl = formData.get('imageUrl') as string
  const imageDescription = formData.get('imageDescription') as string
  const questionType = formData.get('questionType') as string
  const equationLatex = formData.get('equation_latex') as string

  let options = {}
  if (questionType !== 'spr') {
      options = {
          A: formData.get('optionA') as string,
          B: formData.get('optionB') as string,
          C: formData.get('optionC') as string,
          D: formData.get('optionD') as string
      }
  }

  const content = {
    question: questionText,
    passage: passage || null,
    image_url: imageUrl || null,
    image_description: imageDescription || null,
    options: Object.keys(options).length > 0 ? options : null
  }

  const { error } = await supabase
    .from('questions')
    .insert({
      exam_id: examId,
      section,
      module,
      content,
      correct_answer: correctAnswer,
      explanation,
      domain: domain || null,
      equation_latex: equationLatex || null
    })

  if (error) {
    console.error("Error adding question:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/exams/${examId}`)
  // Redirect handled by client or we can just return success
  return { success: true }
}

export async function updateQuestion(questionId: string, examId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const section = formData.get('section') as string
  const module = parseInt(formData.get('module') as string)
  const questionText = formData.get('questionText') as string
  const passage = formData.get('passage') as string
  const optionA = formData.get('optionA') as string
  const optionB = formData.get('optionB') as string
  const optionC = formData.get('optionC') as string
  const optionD = formData.get('optionD') as string
  const correctAnswer = formData.get('correctAnswer') as string
  const explanation = formData.get('explanation') as string
  const domain = formData.get('domain') as string
  const imageUrl = formData.get('imageUrl') as string
  const imageDescription = formData.get('imageDescription') as string
  const questionType = formData.get('questionType') as string
  const equationLatex = formData.get('equation_latex') as string

  let options = {}
  if (questionType !== 'spr') {
      options = {
          A: formData.get('optionA') as string,
          B: formData.get('optionB') as string,
          C: formData.get('optionC') as string,
          D: formData.get('optionD') as string
      }
  }

  const content = {
    question: questionText,
    passage: passage || null,
    image_url: imageUrl || null,
    image_description: imageDescription || null,
    options: Object.keys(options).length > 0 ? options : null
  }

  const { error } = await supabase
    .from('questions')
    .update({
      section,
      module,
      content,
      correct_answer: correctAnswer,
      explanation,
      domain: domain || null,
      equation_latex: equationLatex || null
    })
    .eq('id', questionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/exams/${examId}`)
  redirect(`/admin/exams/${examId}`)
}

export async function deleteQuestion(questionId: string, examId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('questions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', questionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/exams/${examId}`)
  return { success: true }
}

export async function deleteExam(examId: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()
    
    // Soft-delete the exam
    const { error } = await supabase
        .from('exams')
        .update({ deleted_at: now })
        .eq('id', examId)

    if (error) {
        return { error: error.message }
    }

    // Also soft-delete all questions belonging to this exam
    await supabase
        .from('questions')
        .update({ deleted_at: now })
        .eq('exam_id', examId)
        .is('deleted_at', null)

    revalidatePath('/admin/exams')
    revalidatePath('/admin/recycle-bin')
    return { success: true }
}

export async function validateExamQuestions(examId: string) {
  const supabase = await createClient()

  // Fetch all non-deleted questions for this exam in a single query
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, section, module')
    .eq('exam_id', examId)
    .is('deleted_at', null)

  if (error) {
    console.error('Validation query error:', error)
  }

  const allQuestions = questions || []

  const rwM1 = allQuestions.filter(q => q.section === 'reading_writing' && q.module === 1).length
  const rwM2 = allQuestions.filter(q => q.section === 'reading_writing' && q.module === 2).length
  const mathM1 = allQuestions.filter(q => q.section === 'math' && q.module === 1).length
  const mathM2 = allQuestions.filter(q => q.section === 'math' && q.module === 2).length

  const required = {
      rwM1: 27,
      rwM2: 27,
      mathM1: 22,
      mathM2: 22
  }

  const current = {
      rwM1,
      rwM2,
      mathM1,
      mathM2
  }

  const isValid = 
      rwM1 === required.rwM1 && 
      rwM2 === required.rwM2 && 
      mathM1 === required.mathM1 && 
      mathM2 === required.mathM2

  return { isValid, current, required }
}

export async function toggleExamStatus(examId: string, currentStatus: string, classroomId: string | null, prevState: any) {
  const supabase = await createClient()
  
  if (currentStatus !== 'active') {
      const validation = await validateExamQuestions(examId)
      if (!validation.isValid) {
          return { validationError: validation }
      }
  }

  const newStatus = currentStatus === 'active' ? 'ended' : 'active'

  const { error } = await supabase
    .from('exams')
    .update({ 
        status: newStatus,
        classroom_id: classroomId || null
    })
    .eq('id', examId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/exams/${examId}`)
  revalidatePath('/admin/exams')
  return { success: true }
}

export async function updateLockdownPolicy(examId: string, policy: 'log' | 'disqualify') {
  const supabase = await createClient()
  
  // Try using the RPC first as it might bypass schema cache issues
  const { error: rpcError } = await supabase.rpc('update_lockdown_policy', {
    exam_id: examId,
    new_policy: policy
  })

  if (!rpcError) {
    revalidatePath(`/admin/exams/${examId}`)
    return { success: true }
  }

  console.warn("RPC update failed, falling back to direct update:", rpcError.message)

  // Fallback to direct update if RPC fails
  const { error } = await supabase
    .from('exams')
    .update({ lockdown_policy: policy })
    .eq('id', examId)

  if (error) return { error: error.message }
  revalidatePath(`/admin/exams/${examId}`)
  return { success: true }
}

export async function simpleToggleExamStatus(examId: string, currentStatus: string) {
  const supabase = await createClient()
  
  if (currentStatus !== 'active') {
      const validation = await validateExamQuestions(examId)
      if (!validation.isValid) {
          return { validationError: validation }
      }
  }

  const newStatus = currentStatus === 'active' ? 'ended' : 'active'
  
  const { error } = await supabase
    .from('exams')
    .update({ status: newStatus })
    .eq('id', examId)

  if (error) return { error: error.message }
  revalidatePath('/admin/exams')
  return { success: true }
}
