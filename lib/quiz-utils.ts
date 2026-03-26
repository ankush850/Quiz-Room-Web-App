/**
 * Utility functions for quiz operations
 */

// Generate a random 8-character quiz ID
export function generateQuizId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash a password (simple implementation, in production use bcrypt)
export function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use proper password hashing on the backend
  return Buffer.from(password).toString('base64');
}

// Verify a password
export function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString('base64') === hash;
}

// Calculate score from answers
export interface QuestionWithAnswer {
  question_id: string;
  correct_answer: string;
  selected_answer: string;
}

export function calculateScore(
  answers: QuestionWithAnswer[],
  totalQuestions: number
): { score: number; percentage: number } {
  const correctCount = answers.filter((a) => a.correct_answer === a.selected_answer).length;
  const score = correctCount;
  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  return { score, percentage };
}

// Format time for display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get grade based on percentage
export function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
