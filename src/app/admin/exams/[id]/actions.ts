
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateExamCode(examId: string, newCode: string) {
  const code = newCode.trim().toUpperCase()
  if (!code || code.length < 4) {
    return { error: 'Code must be at least 4 characters.' }
  }

  try {
    // Check for duplicates (excluding deleted exams)
    const existing = await prisma.exam.findFirst({
      where: {
        code,
        deletedAt: null,
        NOT: { id: examId },
      },
      select: { id: true },
    })

    if (existing) {
      return { error: 'This code is already in use by another exam.' }
    }

    await prisma.exam.update({
      where: { id: examId },
      data: { code },
    })

    revalidatePath(`/admin/exams/${examId}`)
    return { success: true, code }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function addQuestion(examId: string, formData: FormData) {
  const section = formData.get('section') as string
  const module = parseInt(formData.get('module') as string)
  const questionText = formData.get('questionText') as string
  const passage = formData.get('passage') as string
  const optionA = formData.get('optionA') as string
  const optionB = formData.get('optionB') as string
  const optionC = formData.get('optionC') as string
  const optionD = formData.get('optionD') as string
  const correctAnswer = formData.get('correctAnswer') as string
  const explanation = formData.get('explanation') as string
  const domain = formData.get('domain') as string
  const imageUrl = formData.get('imageUrl') as string
  const imageDescription = formData.get('imageDescription') as string
  const questionType = formData.get('questionType') as string
  const equationLatex = formData.get('equation_latex') as string

  let options = {}
  if (questionType !== 'spr') {
      options = {
          A: formData.get('optionA') as string,
          B: formData.get('optionB') as string,
          C: formData.get('optionC') as string,
          D: formData.get('optionD') as string
      }
  }

  const content = {
    question: questionText,
    passage: passage || null,
    image_url: imageUrl || null,
    image_description: imageDescription || null,
    options: Object.keys(options).length > 0 ? options : null
  }

  try {
    await prisma.question.create({
      data: {
        examId,
        section,
        module,
        content,
        correctAnswer,
        explanation,
        domain: domain || null,
        equationLatex: equationLatex || null,
      },
    })

    revalidatePath(`/admin/exams/${examId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error adding question:', error)
    return { error: error.message }
  }
}

export async function updateQuestion(questionId: string, examId: string, prevState: any, formData: FormData) {
  const section = formData.get('section') as string
  const module = parseInt(formData.get('module') as string)
  const questionText = formData.get('questionText') as string
  const passage = formData.get('passage') as string
  const optionA = formData.get('optionA') as string
  const optionB = formData.get('optionB') as string
  const optionC = formData.get('optionC') as string
  const optionD = formData.get('optionD') as string
  const correctAnswer = formData.get('correctAnswer') as string
  const explanation = formData.get('explanation') as string
  const domain = formData.get('domain') as string
  const imageUrl = formData.get('imageUrl') as string
  const imageDescription = formData.get('imageDescription') as string
  const questionType = formData.get('questionType') as string
  const equationLatex = formData.get('equation_latex') as string

  let options = {}
  if (questionType !== 'spr') {
      options = {
          A: formData.get('optionA') as string,
          B: formData.get('optionB') as string,
          C: formData.get('optionC') as string,
          D: formData.get('optionD') as string
      }
  }

  const content = {
    question: questionText,
    passage: passage || null,
    image_url: imageUrl || null,
    image_description: imageDescription || null,
    options: Object.keys(options).length > 0 ? options : null
  }

  try {
    await prisma.question.update({
      where: { id: questionId },
      data: {
        section,
        module,
        content,
        correctAnswer,
        explanation,
        domain: domain || null,
        equationLatex: equationLatex || null,
      },
    })

    revalidatePath(`/admin/exams/${examId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteQuestion(questionId: string, examId: string) {
  try {
    // Soft delete - set deletedAt timestamp
    await prisma.question.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    })

    revalidatePath(`/admin/exams/${examId}`)
    revalidatePath('/admin/recycle-bin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteExam(examId: string) {
  try {
    // Soft delete - set deletedAt timestamp and cascade to child questions
    await prisma.$transaction(async (tx: any) => {
      // Soft delete all questions in this exam
      await tx.question.updateMany({
        where: { examId },
        data: { deletedAt: new Date() },
      })
      
      // Soft delete the exam itself
      await tx.exam.update({
        where: { id: examId },
        data: { deletedAt: new Date() },
      })
    })

    revalidatePath('/admin/exams')
    revalidatePath('/admin/recycle-bin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function validateExamQuestions(examId: string) {
  try {
    // Fetch all questions for this exam (excluding deleted)
    const questions = await prisma.question.findMany({
      where: { examId, deletedAt: null },
      select: {
        id: true,
        section: true,
        module: true,
      },
    })

    const rwM1 = questions.filter((q: any) => q.section === 'reading_writing' && q.module === 1).length
    const rwM2 = questions.filter((q: any) => q.section === 'reading_writing' && q.module === 2).length
    const mathM1 = questions.filter((q: any) => q.section === 'math' && q.module === 1).length
    const mathM2 = questions.filter((q: any) => q.section === 'math' && q.module === 2).length

    const required = {
        rwM1: 27,
        rwM2: 27,
        mathM1: 22,
        mathM2: 22
    }

    const current = {
        rwM1,
        rwM2,
        mathM1,
        mathM2
    }

    const isValid = 
        rwM1 === required.rwM1 && 
        rwM2 === required.rwM2 && 
        mathM1 === required.mathM1 && 
        mathM2 === required.mathM2

    return { isValid, current, required }
  } catch (error) {
    console.error('Validation query error:', error)
    return { isValid: false, current: { rwM1: 0, rwM2: 0, mathM1: 0, mathM2: 0 }, required: { rwM1: 27, rwM2: 27, mathM1: 22, mathM2: 22 } }
  }
}

export async function toggleExamStatus(examId: string, currentStatus: string, classroomId: string | null, prevState: any) {
  if (currentStatus !== 'active') {
      const validation = await validateExamQuestions(examId)
      if (!validation.isValid) {
          return { validationError: validation }
      }
  }

  const newStatus = currentStatus === 'active' ? 'ended' : 'active'

  try {
    await prisma.exam.update({
      where: { id: examId },
      data: {
        status: newStatus,
        classroomId: classroomId || null,
      },
    })

    revalidatePath(`/admin/exams/${examId}`)
    revalidatePath('/admin/exams')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function updateLockdownPolicy(examId: string, policy: 'log' | 'disqualify') {
  try {
    await prisma.exam.update({
      where: { id: examId },
      data: { lockdownPolicy: policy },
    })

    revalidatePath(`/admin/exams/${examId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function simpleToggleExamStatus(examId: string, currentStatus: string) {
  if (currentStatus !== 'active') {
      const validation = await validateExamQuestions(examId)
      if (!validation.isValid) {
          return { validationError: validation }
      }
  }

  const newStatus = currentStatus === 'active' ? 'ended' : 'active'
  
  try {
    await prisma.exam.update({
      where: { id: examId },
      data: { status: newStatus },
    })

    revalidatePath('/admin/exams')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
