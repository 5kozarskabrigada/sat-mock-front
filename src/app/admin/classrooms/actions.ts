
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createClassroom(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  try {
    await prisma.classroom.create({
      data: {
        name,
        description,
      },
    })

    revalidatePath('/admin/classrooms')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteClassroom(classroomId: string) {
  try {
    await prisma.classroom.delete({
      where: { id: classroomId },
    })

    revalidatePath('/admin/classrooms')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function addStudentToClassroom(classroomId: string, prevState: any, formData: FormData) {
  const username = formData.get('username') as string

  try {
    // First find student by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!user) {
      return { error: 'Student not found with that username' }
    }

    await prisma.studentClassroom.create({
      data: {
        studentId: user.id,
        classroomId,
      },
    })

    revalidatePath(`/admin/classrooms/${classroomId}`)
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return { error: 'Student is already in this classroom' }
    }
    return { error: error.message }
  }
}

export async function removeStudentFromClassroom(classroomId: string, studentId: string) {
  try {
    await prisma.studentClassroom.deleteMany({
      where: {
        classroomId,
        studentId,
      },
    })

    revalidatePath(`/admin/classrooms/${classroomId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function searchStudents(query: string) {
  if (!query || query.length < 1) return []
  
  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
      take: 10,
    })
    
    return students
  } catch (error) {
    console.error('Search students error:', error)
    return []
  }
}
