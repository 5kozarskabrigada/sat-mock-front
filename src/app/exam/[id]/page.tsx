
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExamRunner from './exam-runner'

import { Suspense } from 'react'

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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'student'
  const studentName = profile ? `${profile.first_name} ${profile.last_name}` : 'Student'

  // 1. Check if exam exists and is active
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .single()

  if (!exam) notFound()

  // 2. Check if student has started this exam
  const { data: studentExam } = await supabase
    .from('student_exams')
    .select('id, status')
    .eq('exam_id', id)
    .eq('student_id', user.id)
    .single()

  // Admin Preview Bypass
  if (isAdminPreview && userRole === 'admin') {
    // 3. Fetch questions
    const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

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

  if (studentExam.status === 'completed') {
    redirect('/student/completed')
  }

  // 3. Fetch questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

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
