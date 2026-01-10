
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
    return { error: error.message }
  }

  revalidatePath('/admin/exams')
  redirect(`/admin/exams/${data.id}`)
}
