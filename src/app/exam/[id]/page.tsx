import { redirect, notFound } from 'next/navigation'
import ExamRunner from './exam-runner'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/get-current-user'
import { prisma } from '@/lib/prisma'

export default async function ExamPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { preview } = await searchParams
  const isAdminPreview = preview === 'true'

  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const userRole = user.role || 'student'
  const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student'

  // 1. Check if exam exists and is active
  const exam = await prisma.exam.findUnique({
    where: { id, deletedAt: null },
  })

  if (!exam) notFound()

  // 2. Check if student has started this exam
  const studentExam = await prisma.studentExam.findFirst({
    where: {
      examId: id,
      studentId: user.id,
    },
  })

  // Admin Preview Bypass
  if (isAdminPreview && userRole === 'admin') {
    // 3. Fetch questions
    const questions = await prisma.question.findMany({
      where: {
        examId: id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    })

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Preview...</div>}>
            <ExamRunner 
                exam={exam} 
                questions={questions || []} 
                studentExamId={studentExam?.id || `preview-${user.id}`}
                studentName={`${studentName} (Admin Preview)`}
            />
        </Suspense>
    )
  }

  // Normal Student Flow
  if (!studentExam) {
    redirect('/student')
  }

  // Check if exam is truly completed (has saved answers)
  if (studentExam.status === 'completed') {
    const answerCount = await prisma.studentAnswer.count({
      where: { studentExamId: studentExam.id },
    })

    if (answerCount > 0) {
      // Exam was properly submitted with answers
      redirect('/student/completed')
    } else {
      // Status is 'completed' but no answers saved (partial failure from previous attempt)
      // Reset status so the student can resubmit
      await prisma.studentExam.update({
        where: { id: studentExam.id },
        data: {
          status: 'in_progress',
          completedAt: null,
        },
      })
    }
  }

  // 3. Fetch questions
  const questions = await prisma.question.findMany({
    where: {
      examId: id,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Exam...</div>}>
      <ExamRunner 
        exam={exam} 
        questions={questions || []} 
        studentExamId={studentExam.id}
        studentName={studentName}
      />
    </Suspense>
  )
}
