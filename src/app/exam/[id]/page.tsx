
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExamRunner from './exam-runner'

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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

  if (!studentExam) {
    // If not joined, redirect to join page (student dashboard)
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
    .order('created_at', { ascending: true })

  return (
    <ExamRunner 
      exam={exam} 
      questions={questions || []} 
      studentExamId={studentExam.id} 
    />
  )
}
