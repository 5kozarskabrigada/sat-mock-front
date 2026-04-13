import { classroomsAPI, usersAPI } from '@/lib/api-client'

export async function createClassroom(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  try {
    await classroomsAPI.create({
      name,
      description,
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to create classroom' }
  }
}

export async function deleteClassroom(classroomId: string) {
  try {
    await classroomsAPI.delete(classroomId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to delete classroom' }
  }
}

export async function addStudentToClassroom(classroomId: string, studentId: string) {
  try {
    await classroomsAPI.addStudent(classroomId, studentId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to add student' }
  }
}

export async function removeStudentFromClassroom(classroomId: string, studentId: string) {
  try {
    await classroomsAPI.removeStudent(classroomId, studentId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to remove student' }
  }
}

export async function searchStudents(query: string) {
  if (!query || query.length < 1) return []

  try {
    const response = await usersAPI.getAll({ role: 'student' })
    const students = Array.isArray(response.data) ? response.data : []

    const needle = query.toLowerCase()
    return students
      .filter((student: any) =>
        student.username?.toLowerCase().includes(needle) ||
        student.first_name?.toLowerCase().includes(needle) ||
        student.last_name?.toLowerCase().includes(needle),
      )
      .slice(0, 10)
  } catch (error) {
    console.error('Search students error:', error)
    return []
  }
}
