import { examsAPI, questionsAPI } from '@/lib/api-client'

export async function restoreExam(examId: string) {
  try {
    await examsAPI.restore(examId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to restore exam' }
  }
}

export async function restoreQuestion(questionId: string) {
  try {
    await questionsAPI.restore(questionId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to restore question' }
  }
}

export async function permanentlyDeleteExam(examId: string) {
  try {
    await examsAPI.permanentDelete(examId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to permanently delete exam' }
  }
}

export async function permanentlyDeleteQuestion(questionId: string) {
  try {
    await questionsAPI.permanentDelete(questionId)
    return { success: true }
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message || 'Failed to permanently delete question' }
  }
}
