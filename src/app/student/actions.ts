
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function joinExam(prevState: any, formData: FormData) {
  const code = formData.get('code') as string
  const supabase = await createClient()

  // 1. Find the exam by code
  const { data: exam, error } = await supabase
    .from('exams')
    .select('id, status')
    .eq('code', code)
    .single()

  if (error || !exam) {
    return { error: 'Invalid exam code' }
  }

  if (exam.status !== 'active') {
    return { error: 'This exam has not been started by the instructor yet.' }
  }

  // 2. Create or find student_exam record
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if already started
  const { data: existingAttempt } = await supabase
    .from('student_exams')
    .select('id')
    .eq('student_id', user.id)
    .eq('exam_id', exam.id)
    .single()

  if (!existingAttempt) {
    const { error: createError } = await supabase
      .from('student_exams')
      .insert({
        student_id: user.id,
        exam_id: exam.id,
        status: 'in_progress'
      })
    
    if (createError) {
      return { error: 'Failed to join exam' }
    }
  }

  redirect(`/exam/${exam.id}`)
}
