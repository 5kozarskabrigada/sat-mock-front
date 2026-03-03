
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
// Reading/Writing: 54 questions (27 per module), Math: 44 questions (22 per module)
// 
// IMPORTANT: Score = (Module 1 Score) + (Module 2 Score) - 200
// Verified test case: RW M1(24)+M2(13)=510+270-200=580, Math M1(17)+M2(11)=460+290-200=550

// Reading/Writing Module 1 raw score (0-27) to scaled score
const RW_M1_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 220, 3: 240, 4: 260, 5: 270, 6: 280, 7: 290, 8: 300,
  9: 300, 10: 310, 11: 310, 12: 320, 13: 330, 14: 340, 15: 360, 16: 370,
  17: 390, 18: 410, 19: 420, 20: 440, 21: 460, 22: 470, 23: 490, 24: 510,
  25: 530, 26: 540, 27: 560
}

// Reading/Writing Module 2 raw score (0-27) to scaled score
const RW_M2_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 210, 4: 210, 5: 210, 6: 220, 7: 220, 8: 220,
  9: 230, 10: 230, 11: 240, 12: 250, 13: 270, 14: 290, 15: 290, 16: 300,
  17: 310, 18: 330, 19: 340, 20: 350, 21: 360, 22: 380, 23: 390, 24: 400,
  25: 410, 26: 430, 27: 440
}

// Math Module 1 raw score (0-22) to scaled score
const MATH_M1_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 220, 3: 240, 4: 260, 5: 260, 6: 280, 7: 280, 8: 300,
  9: 300, 10: 310, 11: 340, 12: 360, 13: 380, 14: 400, 15: 420, 16: 440,
  17: 460, 18: 490, 19: 510, 20: 530, 21: 550, 22: 570
}

// Math Module 2 raw score (0-22) to scaled score
const MATH_M2_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 220, 4: 220, 5: 230, 6: 250, 7: 270, 8: 270,
  9: 270, 10: 290, 11: 290, 12: 300, 13: 300, 14: 310, 15: 330, 16: 340,
  17: 360, 18: 370, 19: 390, 20: 400, 21: 420, 22: 430
}

/**
 * Convert raw Reading/Writing scores to scaled score (200-800)
 * Formula: (Module 1 Score) + (Module 2 Score) - 200
 * Based on Albert.io SAT score conversion
 */
export function calculateRWScore(rawCorrect: number, _totalQuestions?: number): number {
  // For backward compatibility, split raw score assuming equal distribution
  // If called with total raw score, assume it's split between modules
  const m1Raw = Math.min(27, Math.round(rawCorrect / 2))
  const m2Raw = Math.min(27, Math.round(rawCorrect - m1Raw))
  return calculateRWScoreByModule(m1Raw, m2Raw)
}

/**
 * Convert raw Reading/Writing module scores to scaled score (200-800)
 * Formula: (Module 1 Score) + (Module 2 Score) - 200
 */
export function calculateRWScoreByModule(m1Correct: number, m2Correct: number): number {
  const m1Clamped = Math.max(0, Math.min(27, Math.round(m1Correct)))
  const m2Clamped = Math.max(0, Math.min(27, Math.round(m2Correct)))
  const m1Score = RW_M1_TABLE[m1Clamped] ?? 200
  const m2Score = RW_M2_TABLE[m2Clamped] ?? 200
  return Math.min(800, Math.max(200, m1Score + m2Score - 200))
}

/**
 * Convert raw Math score to scaled score (200-800)
 * Formula: (Module 1 Score) + (Module 2 Score) - 200
 * Based on Albert.io SAT score conversion
 */
export function calculateMathScore(rawCorrect: number, _totalQuestions?: number): number {
  // For backward compatibility, split raw score assuming equal distribution
  const m1Raw = Math.min(22, Math.round(rawCorrect / 2))
  const m2Raw = Math.min(22, Math.round(rawCorrect - m1Raw))
  return calculateMathScoreByModule(m1Raw, m2Raw)
}

/**
 * Convert raw Math module scores to scaled score (200-800)
 * Formula: (Module 1 Score) + (Module 2 Score) - 200
 */
export function calculateMathScoreByModule(m1Correct: number, m2Correct: number): number {
  const m1Clamped = Math.max(0, Math.min(22, Math.round(m1Correct)))
  const m2Clamped = Math.max(0, Math.min(22, Math.round(m2Correct)))
  const m1Score = MATH_M1_TABLE[m1Clamped] ?? 200
  const m2Score = MATH_M2_TABLE[m2Clamped] ?? 200
  return Math.min(800, Math.max(200, m1Score + m2Score - 200))
}

/**
 * Calculate total SAT score (400-1600)
 * Uses module-based scoring: (M1 + M2 - 200) for each section
 */
export function calculateTotalScore(
  rwCorrect: number, 
  rwTotal: number, 
  mathCorrect: number, 
  mathTotal: number
): { rwScore: number; mathScore: number; totalScore: number } {
  const rwScore = calculateRWScore(rwCorrect)
  const mathScore = calculateMathScore(mathCorrect)
  return {
    rwScore,
    mathScore,
    totalScore: rwScore + mathScore
  }
}

/**
 * Calculate total SAT score with per-module breakdown (400-1600)
 * This is the preferred method for accurate Albert.io-style scoring
 */
export function calculateTotalScoreByModule(
  rwM1Correct: number,
  rwM2Correct: number,
  mathM1Correct: number,
  mathM2Correct: number
): { rwScore: number; mathScore: number; totalScore: number } {
  const rwScore = calculateRWScoreByModule(rwM1Correct, rwM2Correct)
  const mathScore = calculateMathScoreByModule(mathM1Correct, mathM2Correct)
  return {
    rwScore,
    mathScore,
    totalScore: rwScore + mathScore
  }
}
