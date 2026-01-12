
export function calculateDomainScores(questions: any[], answers: any[]) {
  // Map answers by question_id for O(1) lookup
  const answerMap = new Map(answers.map(a => [a.question_id, a]))

  // Group by domain
  const domainStats: Record<string, { total: number, correct: number }> = {}

  questions.forEach(q => {
    const domain = q.domain || 'Uncategorized'
    if (!domainStats[domain]) {
      domainStats[domain] = { total: 0, correct: 0 }
    }

    const answer = answerMap.get(q.id)
    const isCorrect = answer?.is_correct || false // Assuming backend or scoring sets this, or we compare here.
    // Let's assume student_answers has is_correct set. If not, we need to compare.
    // The schema says `is_correct boolean`.
    
    domainStats[domain].total += 1
    if (isCorrect) {
      domainStats[domain].correct += 1
    }
  })

  // Convert to array
  return Object.entries(domainStats).map(([name, stats]) => ({
    name,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }))
}
