
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClassroom(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('classrooms')
    .insert({
      name,
      description
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/classrooms')
  return { success: true }
}

export async function deleteClassroom(classroomId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', classroomId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/classrooms')
  return { success: true }
}

export async function addStudentToClassroom(classroomId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const username = formData.get('username') as string

  // First find student by username
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (userError || !user) {
    return { error: 'Student not found with that username' }
  }

  const { error } = await supabase
    .from('student_classrooms')
    .insert({
      student_id: user.id,
      classroom_id: classroomId
    })

  if (error) {
      if (error.code === '23505') { // Unique violation
          return { error: 'Student is already in this classroom' }
      }
    return { error: error.message }
  }

  revalidatePath(`/admin/classrooms/${classroomId}`)
  return { success: true }
}

export async function removeStudentFromClassroom(classroomId: string, studentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('student_classrooms')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('student_id', studentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/classrooms/${classroomId}`)
  return { success: true }
}

export async function searchStudents(query: string) {
  if (!query || query.length < 1) return []
  
  const supabase = await createClient()
  
  // ILIKE for case-insensitive partial match
  const { data, error } = await supabase
    .from('users')
    .select('id, username, first_name, last_name')
    .eq('role', 'student')
    .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(10)
    
  if (error) {
    console.error('Search students error:', error)
    return []
  }
  
  return data || []
}
