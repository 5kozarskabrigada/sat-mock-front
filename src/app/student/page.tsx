import JoinExamForm from './JoinForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import { getCurrentUser } from '@/lib/get-current-user'
import { prisma } from '@/lib/prisma'

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active exams (in_progress)
  const activeExams = await prisma.studentExam.findMany({
    where: {
      studentId: user.id,
      status: 'in_progress',
    },
    include: {
      exam: {
        select: {
          title: true,
          code: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8 mx-auto w-fit">
           <Logo className="h-24 w-auto" /> 
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the exam code provided by your instructor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <JoinExamForm />
        </div>

        {/* Active Exams List */}
        {activeExams && activeExams.length > 0 && (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Resume Active Exams</h3>
            <div className="space-y-4">
              {activeExams.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div>
                    <h4 className="font-bold text-indigo-900">{attempt.exam?.title || 'Untitled Exam'}</h4>
                    <p className="text-xs text-indigo-700 mt-1">Code: {attempt.exam?.code}</p>
                  </div>
                  <Link
                    href={`/exam/${attempt.examId}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resume
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
             <form action="/auth/signout" method="post">
                 <button className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
             </form>
        </div>
      </div>
    </div>
  )
}
