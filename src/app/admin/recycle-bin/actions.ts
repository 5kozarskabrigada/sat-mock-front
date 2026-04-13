
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function restoreExam(examId: string) {
  try {
    // Restore exam and all its questions by clearing deletedAt
    await prisma.$transaction(async (tx: any) => {
      // Restore all questions in this exam
      await tx.question.updateMany({
        where: { examId },
        data: { deletedAt: null },
      })
      
      // Restore the exam itself
      await tx.exam.update({
        where: { id: examId },
        data: { deletedAt: null },
      })
    })
    
    revalidatePath('/admin/recycle-bin')
    revalidatePath('/admin/exams')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function restoreQuestion(questionId: string) {
  try {
    // Restore question by clearing deletedAt
    await prisma.question.update({
      where: { id: questionId },
      data: { deletedAt: null },
    })
    
    revalidatePath('/admin/recycle-bin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function permanentlyDeleteExam(examId: string) {
  try {
    await prisma.exam.delete({
      where: { id: examId }
    })
    
    revalidatePath('/admin/recycle-bin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function permanentlyDeleteQuestion(questionId: string) {
  try {
    await prisma.question.delete({
      where: { id: questionId }
    })
    
    revalidatePath('/admin/recycle-bin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
