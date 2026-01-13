
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

  const content = {
    question: questionText,
    passage: passage || null,
    image_url: imageUrl || null,
    options: {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD
    }
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
      domain: domain || null
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

  const content = {
    question: questionText,
    passage: passage || null,
    image_url: imageUrl || null,
    options: {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD
    }
  }

  const { error } = await supabase
    .from('questions')
    .update({
      section,
      module,
      content,
      correct_answer: correctAnswer,
      explanation,
      domain: domain || null
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
    
    const { error } = await supabase
        .from('exams')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', examId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/exams')
    return { success: true }
}

export async function validateExamQuestions(examId: string) {
  const supabase = await createClient()

  const getCount = async (section: string, module: number) => {
    const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', examId)
        .eq('section', section)
        .eq('module', module)
        .is('deleted_at', null)
    return count || 0
  }

  const rwM1 = await getCount('reading_writing', 1)
  const rwM2 = await getCount('reading_writing', 2)
  const mathM1 = await getCount('math', 1)
  const mathM2 = await getCount('math', 2)

  const required = {
      rwM1: 32,
      rwM2: 32,
      mathM1: 28,
      mathM2: 28
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
