
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

  const content = {
    question: questionText,
    passage: passage || null,
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
      explanation
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/exams/${examId}`)
  return { success: true }
}

export async function toggleExamStatus(examId: string, currentStatus: boolean, prevState: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('exams')
    .update({ is_active: !currentStatus })
    .eq('id', examId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/exams/${examId}`)
  revalidatePath('/admin/exams')
}
