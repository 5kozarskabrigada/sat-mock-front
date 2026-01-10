
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

  // 2. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 3. Ensure user profile exists (Lazy Sync)
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
      console.error('Join exam error:', createError)
      // Return specific error message if useful, otherwise generic
      return { error: `Failed to join exam: ${createError.message}` }
    }
  }

  redirect(`/exam/${exam.id}`)
}
