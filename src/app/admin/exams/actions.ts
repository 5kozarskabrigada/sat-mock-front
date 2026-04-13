
'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/get-current-user'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createExam(prevState: any, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const code = Math.random().toString(36).substring(2, 8).toUpperCase() // Simple random code

  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        code,
        createdBy: user.id,
        status: 'draft',
      },
    })

    revalidatePath('/admin/exams')
    return { success: true, examId: exam.id }
  } catch (error: any) {
    console.error('Create exam error:', error)
    return { error: error.message }
  }
}
