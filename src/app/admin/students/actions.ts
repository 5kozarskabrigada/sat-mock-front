
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.')
  }

  return createClient(url, key)
}

function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function generateUsername(firstName: string, lastName: string) {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${randomSuffix}`;
}

export async function createStudent(prevState: any, formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!firstName || !lastName) {
    return { error: 'First name and last name are required' }
  }

  const username = generateUsername(firstName, lastName)
  const password = generatePassword()
  const email = `${username}@sat-platform.local`

  try {
    const supabaseAdmin = getAdminClient()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        first_name: firstName,
        last_name: lastName,
        role: 'student'
      }
    })

    if (error) {
      console.error('Create user error:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/students')

    return {
      success: true,
      credentials: {
        username,
        password,
        firstName,
        lastName
      }
    }
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const supabaseAdmin = getAdminClient()

    // Delete from Auth (this cascades to public.users via DB constraints usually, 
    // but if not, triggers or manual deletion might be needed. 
    // In our init.sql: "id uuid references auth.users not null primary key" -> deleting auth user should cascade or fail if RESTRICT.
    // However, usually cascading deletion from auth.users isn't automatic unless configured on FK.
    // Supabase Auth deletion is definitive.)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(studentId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/students')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateStudent(studentId: string, formData: FormData) {
    try {
        const supabaseAdmin = getAdminClient()
        
        const firstName = formData.get('firstName') as string
        const lastName = formData.get('lastName') as string
        const password = formData.get('password') as string

        const updates: any = {
            user_metadata: {
                first_name: firstName,
                last_name: lastName
            }
        }

        if (password && password.trim().length > 0) {
            updates.password = password
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(studentId, updates)

        if (error) {
            return { error: error.message }
        }
        
        // Also update public.users to keep sync if triggers don't handle updates (our trigger only handles INSERT)
        // We need a separate client for public schema update or use Service Role key for public table too.
        // supabaseAdmin can access public tables too if RLS allows or if it's superuser.
        // Service role bypasses RLS.
        
        const { error: publicError } = await supabaseAdmin
            .from('users')
            .update({
                first_name: firstName,
                last_name: lastName
            })
            .eq('id', studentId)

        if (publicError) {
             console.error('Failed to sync public profile', publicError)
        }

        revalidatePath('/admin/students')
        return { success: true }

    } catch (err: any) {
        return { error: err.message }
    }
}
