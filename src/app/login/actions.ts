
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // If "invalid login credentials", just say "Invalid username or password"
    // Sometimes Auth API returns generic "Invalid login credentials" which is fine, but sometimes obscure.
    return { error: 'Invalid username or password' }
  }

  // Check role to redirect appropriately
  // NOTE: This runs on server, so redirect throws error to navigate.
  // We need to fetch profile.
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role === 'admin') {
      redirect('/admin/exams') // Better default landing for admin
    } else {
      redirect('/student')
    }
  }

  // Fallback if something weird happens
  redirect('/')
}
