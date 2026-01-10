
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
    // Initialize client lazily to prevent crash on module load if env vars are missing
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

    // Trigger revalidation of the student list
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
