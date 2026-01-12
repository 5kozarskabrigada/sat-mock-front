
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function restoreExam(examId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('exams')
    .update({ deleted_at: null })
    .eq('id', examId)

  if (error) return { error: error.message }
  revalidatePath('/admin/recycle-bin')
  revalidatePath('/admin/exams')
  return { success: true }
}

export async function restoreQuestion(questionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ deleted_at: null })
    .eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin/recycle-bin')
  return { success: true }
}

export async function permanentlyDeleteExam(examId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)

  if (error) return { error: error.message }
  revalidatePath('/admin/recycle-bin')
  return { success: true }
}

export async function permanentlyDeleteQuestion(questionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) return { error: error.message }
  revalidatePath('/admin/recycle-bin')
  return { success: true }
}
