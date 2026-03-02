
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

// Albert.io SAT Score Conversion Tables
// Based on typical SAT scoring curves
// Reading/Writing: 54 questions, Math: 44 questions

// Reading/Writing raw score (0-54) to scaled score (200-800)
const RW_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 200, 4: 210, 5: 220, 6: 230, 7: 240, 8: 250,
  9: 260, 10: 270, 11: 280, 12: 290, 13: 300, 14: 310, 15: 320, 16: 330,
  17: 340, 18: 350, 19: 360, 20: 370, 21: 380, 22: 390, 23: 400, 24: 410,
  25: 420, 26: 430, 27: 440, 28: 450, 29: 460, 30: 470, 31: 480, 32: 490,
  33: 500, 34: 510, 35: 520, 36: 530, 37: 540, 38: 550, 39: 560, 40: 580,
  41: 590, 42: 610, 43: 620, 44: 640, 45: 650, 46: 670, 47: 680, 48: 700,
  49: 720, 50: 740, 51: 760, 52: 780, 53: 790, 54: 800
}

// Math raw score (0-44) to scaled score (200-800)
const MATH_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 210, 3: 230, 4: 250, 5: 270, 6: 290, 7: 310, 8: 320,
  9: 340, 10: 360, 11: 370, 12: 390, 13: 400, 14: 420, 15: 430, 16: 450,
  17: 460, 18: 480, 19: 490, 20: 510, 21: 520, 22: 540, 23: 550, 24: 560,
  25: 580, 26: 590, 27: 600, 28: 620, 29: 630, 30: 640, 31: 660, 32: 670,
  33: 690, 34: 700, 35: 710, 36: 730, 37: 740, 38: 760, 39: 770, 40: 780,
  41: 790, 42: 790, 43: 800, 44: 800
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
