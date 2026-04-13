'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/get-current-user'

// Save answers periodically during exam (at module transitions) to prevent data loss
export async function saveAnswersProgress(studentExamId: string, answers: Record<string, any>) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify the student owns this exam attempt
  const studentExam = await prisma.studentExam.findFirst({
    where: {
      id: studentExamId,
      studentId: user.id,
    },
    select: {
      examId: true,
      studentId: true,
      status: true,
    },
  })
      
  if (!studentExam) {
    return { error: 'Student exam not found' }
  }

  // Don't save if exam is already completed
  if (studentExam.status === 'completed') {
    return { success: true }
  }

  // Fetch all questions for this exam (excluding soft-deleted)
  const questions = await prisma.question.findMany({
    where: {
      examId: studentExam.examId,
      deletedAt: null,
    },
    select: {
      id: true,
      correctAnswer: true,
      section: true,
    },
  })

  const questionMap = new Map(questions?.map(q => [q.id, q]))

  // Grade answers - only for valid questions in the exam
  const answerUpserts = Object.entries(answers)
    .filter(([questionId]) => questionMap.has(questionId))
    .map(([questionId, value]) => {
      const question = questionMap.get(questionId)
      let isCorrect = false
      const answerStr = value?.toString().trim() || ''

      if (question && question.correctAnswer) {
        const correctAnswers = question.correctAnswer.split('|').map((a: string) => a.trim())
        isCorrect = correctAnswers.includes(answerStr)
      }

      return {
        studentExamId,
        questionId,
        answerValue: answerStr,
        isCorrect,
      }
    })

  if (answerUpserts.length > 0) {
    // Use upsert to update existing answers or insert new ones
    try {
      await prisma.$transaction(
        answerUpserts.map((answer: any) =>
          prisma.studentAnswer.upsert({
            where: {
              studentExamId_questionId: {
                studentExamId: answer.studentExamId,
                questionId: answer.questionId,
              },
            },
            update: {
              answerValue: answer.answerValue,
              isCorrect: answer.isCorrect,
            },
            create: answer,
          })
        )
      )
    } catch (error: any) {
      console.error('Failed to save answer progress:', error)
      return { error: 'Failed to save progress' }
    }
  }

  return { success: true }
}

export async function submitExam(studentExamId: string, answers: Record<string, any>) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  // 0. Verify the student owns this exam attempt
  const studentExam = await prisma.studentExam.findFirst({
    where: {
      id: studentExamId,
      studentId: user.id,
    },
    select: {
      examId: true,
      studentId: true,
      status: true,
    },
  })
      
  if (!studentExam) {
      return { error: 'Student exam not found' }
  }

  // Fetch all questions for this exam (excluding soft-deleted)
  const questions = await prisma.question.findMany({
    where: {
      examId: studentExam.examId,
      deletedAt: null,
    },
    select: {
      id: true,
      correctAnswer: true,
      section: true,
    },
  })

  const questionMap = new Map(questions?.map(q => [q.id, q]))

  // 1. Grade answers - only for valid questions in the exam
  const answerInserts = Object.entries(answers)
    .filter(([questionId]) => questionMap.has(questionId)) // Only include answers for valid questions
    .map(([questionId, value]) => {
      const question = questionMap.get(questionId)
      let isCorrect = false
      const answerStr = value?.toString().trim() || ''

      if (question && question.correctAnswer) {
          const correctAnswers = question.correctAnswer.split('|').map((a: string) => a.trim())
          isCorrect = correctAnswers.includes(answerStr)
      }

      return {
          studentExamId,
          questionId,
          answerValue: answerStr,
          isCorrect,
      }
    })

  // 2. Delete old answers + insert new ones, then update status
  // We do this sequentially to ensure answers are saved before marking as completed
  
  try {
    // First, clear any partial answers from previous failed attempts
    await prisma.studentAnswer.deleteMany({
      where: { studentExamId },
    })

    // Insert graded answers
    if (answerInserts.length > 0) {
      await prisma.studentAnswer.createMany({
        data: answerInserts,
      })
    }

    // Only mark as completed AFTER answers are successfully saved
    await prisma.studentExam.update({
      where: { id: studentExamId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // 3. Log activity (non-critical, fire and forget)
    prisma.activityLog.create({
      data: {
        userId: studentExam.studentId,
        studentExamId,
        examId: studentExam.examId,
        type: 'exam_completed',
        details: 'Student submitted the exam',
      },
    }).catch((error) => {
      console.error('Failed to log exam completion:', error)
    })

    return { success: true }
  } catch (error: any) {
    console.error('Failed to submit exam:', error)
    return { error: 'Failed to save your answers. Please try again.' }
  }
}

export async function logLockdownViolation(studentExamId: string, details?: string) {
  // 1. Log the activity
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    select: {
      examId: true,
      studentId: true,
      lockdownViolations: true,
    },
  })

  if (!studentExam) {
    console.error('Error fetching student exam for logging')
    return { error: 'Exam not found' }
  }

  const isDisqualification = details?.toLowerCase().includes('disqualified')
  
  try {
    // Log activity and increment violations
    await prisma.$transaction([
      prisma.activityLog.create({
        data: {
          userId: studentExam.studentId,
          studentExamId,
          examId: studentExam.examId,
          type: isDisqualification ? 'exam_disqualified' : 'lockdown_violation',
          details: details || 'Student attempted to leave the exam environment',
        },
      }),
      prisma.studentExam.update({
        where: { id: studentExamId },
        data: {
          lockdownViolations: (studentExam.lockdownViolations || 0) + 1,
        },
      }),
    ])
  } catch (error) {
    console.error('Failed to log lockdown violation:', error)
  }

  return { success: true }
}

export async function logExamStarted(studentExamId: string) {
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    select: {
      examId: true,
      studentId: true,
    },
  })

  if (!studentExam) {
    console.error('Error fetching student exam for starting log')
    return { error: 'Exam not found' }
  }

  try {
    await prisma.activityLog.create({
      data: {
        userId: studentExam.studentId,
        studentExamId,
        examId: studentExam.examId,
        type: 'exam_started',
        details: 'Student started the mock exam',
      },
    })
  } catch (error) {
    console.error('Failed to log exam started:', error)
  }
  
  return { success: true }
}

export async function heartbeat(studentExamId: string) {
  try {
    await prisma.studentExam.update({
      where: {
        id: studentExamId,
        status: 'in_progress',
      },
      data: {
        updatedAt: new Date(),
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Heartbeat failed:', error)
    return { success: false }
  }
}

export async function disqualifyStudent(studentExamId: string, details: string) {
  // 1. Fetch exam info
  const studentExam = await prisma.studentExam.findUnique({
    where: { id: studentExamId },
    select: {
      examId: true,
      studentId: true,
      lockdownViolations: true,
    },
  })

  if (!studentExam) return { error: 'Not found' }

  // 2. Atomic update: status = completed, increment violations, log activity
  const now = new Date()
  
  try {
    await prisma.$transaction([
      // Update status to completed (disqualified) and increment violations
      prisma.studentExam.update({
        where: { id: studentExamId },
        data: {
          status: 'completed',
          completedAt: now,
          lockdownViolations: (studentExam.lockdownViolations || 0) + 1,
        },
      }),
      
      // Log the disqualification
      prisma.activityLog.create({
        data: {
          userId: studentExam.studentId,
          studentExamId,
          examId: studentExam.examId,
          type: 'exam_disqualified',
          details,
        },
      }),
    ])
    
    revalidatePath('/admin/exams/' + studentExam.examId)
    revalidatePath('/student')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to disqualify student:', error)
    return { error: 'Failed to disqualify student' }
  }
}
