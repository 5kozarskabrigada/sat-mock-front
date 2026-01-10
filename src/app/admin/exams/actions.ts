
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createExam(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const code = Math.random().toString(36).substring(2, 8).toUpperCase() // Simple random code

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('exams')
    .insert({
      title,
      description,
      type,
      code,
      created_by: user.id,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Create exam error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/exams')
  // No immediate redirect here to prevent 404 race condition.
  // We will return the ID to the client, and the client can redirect.
  // OR we can rely on Next.js handling it if we trust the consistency.
  // The 404 is likely due to the page not being revalidated/generated fast enough on Vercel's edge network 
  // or simple latency.
  
  // Let's stick to redirect but maybe the ID type was an issue? UUID is string.
  // The user reported 404 "This page could not be found".
  // This usually means the route /admin/exams/[id] matches, but the page logic (notFound()) returns 404
  // because the fetch for the exam failed (didn't find the record).
  // This implies Supabase replica lag or just bad luck.
  
  return { success: true, examId: data.id }
}
