
'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/get-current-user'

export async function joinExam(prevState: any, formData: FormData) {
  const code = (formData.get('code') as string).trim().toUpperCase()

  // 1. Find the exam by code
  const exam = await prisma.exam.findFirst({
    where: {
      code,
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
      classroomId: true,
    },
  })

  if (!exam) {
    return { error: 'Invalid exam code' }
  }

  // 2. Get authenticated user
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // 3. Check Classroom Access
  if (exam.classroomId) {
    const enrollment = await prisma.studentClassroom.findFirst({
      where: {
        studentId: user.id,
        classroomId: exam.classroomId,
      },
    })
      
    if (!enrollment) {
      return { error: 'You are not enrolled in the classroom assigned to this exam.' }
    }
  }

  if (exam.status !== 'active') {
    return { error: 'This exam has not been started by the instructor yet.' }
  }

  // 4. Check if already started
  const existingAttempt = await prisma.studentExam.findFirst({
    where: {
      studentId: user.id,
      examId: exam.id,
    },
    select: {
      id: true,
      status: true,
    },
  })

  if (existingAttempt) {
    if (existingAttempt.status === 'completed') {
      return { error: 'You have already submitted this exam or have been disqualified.' }
    }
    // Strict Join Policy: Cannot use code again if already started.
    return { error: 'You have already joined this exam. Please resume it from your dashboard.' }
  }

  try {
    // Create new student exam attempt
    const newAttempt = await prisma.studentExam.create({
      data: {
        studentId: user.id,
        examId: exam.id,
        status: 'in_progress',
      },
      select: {
        id: true,
      },
    })
    
    // 5. Log joining activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        examId: exam.id,
        studentExamId: newAttempt.id,
        type: 'exam_joined',
        details: `Student joined the exam using code: ${code}`,
      },
    }).catch((error) => {
      console.error('Failed to log exam joined:', error)
    })

    redirect(`/exam/${exam.id}`)
  } catch (error: any) {
    console.error('Join exam error:', error)
    return { error: `Failed to join exam: ${error.message}` }
  }
}
