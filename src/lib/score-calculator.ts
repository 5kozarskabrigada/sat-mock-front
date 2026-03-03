
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

// Albert.io Digital SAT Score Conversion Tables
// Source: https://www.albert.io/blog/sat-score-calculator/
// Reading/Writing: 54 questions, Math: 44 questions

// Reading/Writing raw score (0-54) to scaled score (200-800)
// Exact values from Albert.io Digital SAT Calculator (2024)
const RW_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 200, 4: 200, 5: 200, 6: 200, 7: 210, 8: 220,
  9: 230, 10: 240, 11: 260, 12: 280, 13: 290, 14: 310, 15: 320, 16: 340,
  17: 350, 18: 360, 19: 380, 20: 390, 21: 400, 22: 420, 23: 430, 24: 440,
  25: 460, 26: 470, 27: 480, 28: 490, 29: 500, 30: 510, 31: 520, 32: 540,
  33: 550, 34: 560, 35: 570, 36: 580, 37: 600, 38: 610, 39: 620, 40: 640,
  41: 650, 42: 660, 43: 680, 44: 690, 45: 700, 46: 720, 47: 730, 48: 740,
  49: 750, 50: 760, 51: 780, 52: 790, 53: 790, 54: 800
}

// Math raw score (0-44) to scaled score (200-800)
// Exact values from Albert.io Digital SAT Calculator (2024)
const MATH_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 210, 4: 220, 5: 240, 6: 260, 7: 280, 8: 300,
  9: 320, 10: 340, 11: 360, 12: 380, 13: 400, 14: 410, 15: 430, 16: 450,
  17: 460, 18: 480, 19: 500, 20: 510, 21: 530, 22: 540, 23: 560, 24: 570,
  25: 590, 26: 600, 27: 620, 28: 630, 29: 650, 30: 660, 31: 680, 32: 690,
  33: 710, 34: 720, 35: 740, 36: 750, 37: 770, 38: 780, 39: 790, 40: 800,
  41: 800, 42: 800, 43: 800, 44: 800
}

/**
 * Convert raw Reading/Writing score to scaled score (200-800)
 * Based on Albert.io SAT score conversion
 */
export function calculateRWScore(rawCorrect: number, totalQuestions: number): number {
  // Normalize to 54-question scale if different
  const normalized = totalQuestions > 0 
    ? Math.round((rawCorrect / totalQuestions) * 54) 
    : 0
  const clamped = Math.max(0, Math.min(54, normalized))
  return RW_SCORE_TABLE[clamped] || 200
}

/**
 * Convert raw Math score to scaled score (200-800)
 * Based on Albert.io SAT score conversion
 */
export function calculateMathScore(rawCorrect: number, totalQuestions: number): number {
  // Normalize to 44-question scale if different
  const normalized = totalQuestions > 0 
    ? Math.round((rawCorrect / totalQuestions) * 44) 
    : 0
  const clamped = Math.max(0, Math.min(44, normalized))
  return MATH_SCORE_TABLE[clamped] || 200
}

/**
 * Calculate total SAT score (400-1600)
 */
export function calculateTotalScore(
  rwCorrect: number, 
  rwTotal: number, 
  mathCorrect: number, 
  mathTotal: number
): { rwScore: number; mathScore: number; totalScore: number } {
  const rwScore = calculateRWScore(rwCorrect, rwTotal)
  const mathScore = calculateMathScore(mathCorrect, mathTotal)
  return {
    rwScore,
    mathScore,
    totalScore: rwScore + mathScore
  }
}
