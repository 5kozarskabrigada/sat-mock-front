
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
// IMPORTANT: These tables use DIRECT raw-to-scaled lookup (no percentage normalization)
// Verified test case: RW 37→580, Math 28→550, Total 1130

// Reading/Writing raw score (0-54) to scaled score (200-800)
// Exact values from Albert.io Digital SAT Calculator
const RW_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 200, 4: 200, 5: 200, 6: 200, 7: 200, 8: 200,
  9: 200, 10: 200, 11: 210, 12: 220, 13: 230, 14: 240, 15: 260, 16: 280,
  17: 290, 18: 310, 19: 320, 20: 340, 21: 350, 22: 360, 23: 380, 24: 390,
  25: 410, 26: 420, 27: 430, 28: 450, 29: 460, 30: 470, 31: 490, 32: 500,
  33: 510, 34: 530, 35: 540, 36: 560, 37: 580, 38: 590, 39: 610, 40: 620,
  41: 640, 42: 650, 43: 670, 44: 680, 45: 690, 46: 710, 47: 720, 48: 740,
  49: 750, 50: 760, 51: 780, 52: 790, 53: 790, 54: 800
}

// Math raw score (0-44) to scaled score (200-800)
// Exact values from Albert.io Digital SAT Calculator
const MATH_SCORE_TABLE: Record<number, number> = {
  0: 200, 1: 200, 2: 200, 3: 200, 4: 200, 5: 200, 6: 200, 7: 210, 8: 230,
  9: 250, 10: 270, 11: 290, 12: 310, 13: 330, 14: 350, 15: 370, 16: 390,
  17: 400, 18: 420, 19: 440, 20: 460, 21: 470, 22: 490, 23: 510, 24: 520,
  25: 530, 26: 540, 27: 540, 28: 550, 29: 570, 30: 590, 31: 610, 32: 630,
  33: 650, 34: 670, 35: 690, 36: 710, 37: 730, 38: 750, 39: 770, 40: 780,
  41: 790, 42: 790, 43: 800, 44: 800
}

/**
 * Convert raw Reading/Writing score to scaled score (200-800)
 * Uses direct raw-to-scaled lookup (NO percentage normalization)
 * Based on Albert.io SAT score conversion
 */
export function calculateRWScore(rawCorrect: number, _totalQuestions?: number): number {
  // Direct lookup - no normalization, just clamp to valid range
  const clamped = Math.max(0, Math.min(54, Math.round(rawCorrect)))
  return RW_SCORE_TABLE[clamped] ?? 200
}

/**
 * Convert raw Math score to scaled score (200-800)
 * Uses direct raw-to-scaled lookup (NO percentage normalization)
 * Based on Albert.io SAT score conversion
 */
export function calculateMathScore(rawCorrect: number, _totalQuestions?: number): number {
  // Direct lookup - no normalization, just clamp to valid range
  const clamped = Math.max(0, Math.min(44, Math.round(rawCorrect)))
  return MATH_SCORE_TABLE[clamped] ?? 200
}

/**
 * Calculate total SAT score (400-1600)
 * Accepts raw correct counts directly (no percentage scaling)
 */
export function calculateTotalScore(
  rwCorrect: number, 
  rwTotal: number, 
  mathCorrect: number, 
  mathTotal: number
): { rwScore: number; mathScore: number; totalScore: number } {
  // Use raw correct counts directly for lookup
  const rwScore = calculateRWScore(rwCorrect)
  const mathScore = calculateMathScore(mathCorrect)
  return {
    rwScore,
    mathScore,
    totalScore: rwScore + mathScore
  }
}
