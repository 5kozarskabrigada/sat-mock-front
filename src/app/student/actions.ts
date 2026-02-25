
'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function joinExam(prevState: any, formData: FormData) {
  const code = formData.get('code') as string
  const supabase = await createClient()

  // 1. Find the exam by code using service role to bypass RLS
  // RLS hides exams from students if they're not in the right classroom or exam isn't active
  const serviceClient = createServiceClient()
  const { data: exam, error } = await serviceClient
    .from('exams')
    .select('id, status, classroom_id, deleted_at')
    .eq('code', code)
    .single()

  if (error || !exam) {
    return { error: 'Invalid exam code' }
  }

  if (exam.deleted_at) {
    return { error: 'This exam has been deleted.' }
  }

  // 2. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 3. Check Classroom Access
  if (exam.classroom_id) {
      const { data: enrollment } = await supabase
        .from('student_classrooms')
        .select('id')
        .eq('student_id', user.id)
        .eq('classroom_id', exam.classroom_id)
        .single()
      
      if (!enrollment) {
          return { error: 'You are not enrolled in the classroom assigned to this exam.' }
      }
  }

  if (exam.status !== 'active') {
    return { error: 'This exam has not been started by the instructor yet.' }
  }

  // 4. Ensure user profile exists (Lazy Sync)
  // This prevents FK violations if the user creation trigger failed
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    console.log(`Lazy syncing user ${user.id} to public.users`)
    const { error: syncError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'student',
        first_name: user.user_metadata?.first_name || 'Student',
        last_name: user.user_metadata?.last_name || '',
        role: 'student',
        password_hash: 'managed_by_lazy_sync'
      })
    
    if (syncError) {
      console.error('Lazy sync failed:', syncError)
      return { error: 'Account setup error: Could not sync user profile. Please contact support.' }
    }
  }

  // 4. Check if already started
  const { data: existingAttempt } = await supabase
    .from('student_exams')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('exam_id', exam.id)
    .single()

  if (existingAttempt) {
    if (existingAttempt.status === 'completed') {
      return { error: 'You have already submitted this exam or have been disqualified.' }
    }
    // Strict Join Policy: Cannot use code again if already started.
    return { error: 'You have already joined this exam. Please resume it from your dashboard.' }
  }

  let studentExamId: string

  const { data: newAttempt, error: createError } = await supabase
    .from('student_exams')
    .insert({
      student_id: user.id,
      exam_id: exam.id,
      status: 'in_progress'
    })
    .select('id')
    .single()
  
  if (createError) {
    console.error('Join exam error:', createError)
    return { error: `Failed to join exam: ${createError.message}` }
  }
  studentExamId = newAttempt.id

  // 5. Log joining activity
  const { error: logError } = await supabase.from('activity_logs').insert({
    user_id: user.id,
    exam_id: exam.id,
    student_exam_id: studentExamId,
    type: 'exam_joined',
    details: `Student joined the exam using code: ${code}`
  })
  
  if (logError) console.error('Failed to log exam joined:', logError)

  redirect(`/exam/${exam.id}`)
}
