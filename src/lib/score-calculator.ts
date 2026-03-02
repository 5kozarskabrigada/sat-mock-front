
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
// Exact values from Albert.io
const RW_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 200, 4: 200, 5: 200, 6: 200, 7: 210, 8: 220,
  9: 230, 10: 240, 11: 250, 12: 260, 13: 280, 14: 290, 15: 300, 16: 310,
  17: 320, 18: 330, 19: 340, 20: 350, 21: 360, 22: 370, 23: 380, 24: 390,
  25: 400, 26: 410, 27: 420, 28: 430, 29: 440, 30: 450, 31: 460, 32: 470,
  33: 480, 34: 490, 35: 500, 36: 510, 37: 520, 38: 530, 39: 540, 40: 560,
  41: 580, 42: 600, 43: 610, 44: 630, 45: 650, 46: 670, 47: 690, 48: 710,
  49: 730, 50: 750, 51: 770, 52: 780, 53: 790, 54: 800
}

// Math raw score (0-44) to scaled score (200-800)
// Exact values from Albert.io
const MATH_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 200, 4: 210, 5: 220, 6: 240, 7: 260, 8: 280,
  9: 300, 10: 320, 11: 340, 12: 360, 13: 370, 14: 390, 15: 400, 16: 420,
  17: 440, 18: 450, 19: 470, 20: 490, 21: 500, 22: 520, 23: 530, 24: 550,
  25: 560, 26: 580, 27: 590, 28: 610, 29: 620, 30: 640, 31: 650, 32: 670,
  33: 680, 34: 700, 35: 720, 36: 730, 37: 750, 38: 770, 39: 780, 40: 790,
  41: 790, 42: 800, 43: 800, 44: 800
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
